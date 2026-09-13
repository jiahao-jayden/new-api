/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import i18next from 'i18next'
import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'

import { useSystemConfig } from '@/hooks/use-system-config'

import {
  calculateCnyAmount,
  calculateStripeAmount,
  calculateWaffoPancakeAmount,
  requestPayment,
  requestStripePayment,
  isApiSuccess,
} from '../api'
import {
  isStripePayment,
  isWaffoPancakePayment,
  submitPaymentForm,
} from '../lib'
import { getPaymentAmountRequest } from '../lib/payment-amount'
import type { CnyPaymentQuote } from '../types'

// ============================================================================
// Payment Hook
// ============================================================================

export function usePayment() {
  const { currency } = useSystemConfig()
  const [amount, setAmount] = useState<number>(0)
  const [quote, setQuote] = useState<CnyPaymentQuote | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [processing, setProcessing] = useState(false)
  const quoteSequence = useRef(0)

  // Calculate payment amount
  const calculatePaymentAmount = useCallback(
    async (topupAmount: number, paymentType: string) => {
      const sequence = ++quoteSequence.current
      setQuote(null)
      setAmount(0)
      const request = getPaymentAmountRequest(
        topupAmount,
        paymentType,
        currency.quotaDisplayType,
        currency.usdExchangeRate
      )
      if (!request || paymentType === 'waffo') {
        setCalculating(false)
        return 0
      }
      try {
        setCalculating(true)

        if ('payment_amount_cny' in request) {
          const response = isStripePayment(paymentType)
            ? await calculateStripeAmount(request)
            : await calculateCnyAmount(request)
          if (sequence !== quoteSequence.current) return 0
          if (isApiSuccess(response) && response.data?.currency === 'CNY') {
            setQuote(response.data)
            setAmount(response.data.payment_amount_cny)
            return response.data.payment_amount_cny
          }
          return 0
        }

        const response = await calculateWaffoPancakeAmount(request)
        if (sequence !== quoteSequence.current) return 0

        if (isApiSuccess(response) && response.data) {
          const calculatedAmount = Number.parseFloat(response.data)
          if (!Number.isFinite(calculatedAmount) || calculatedAmount <= 0) {
            return 0
          }
          setAmount(calculatedAmount)
          return calculatedAmount
        }

        // Don't show error for calculation, just set to 0
        setAmount(0)
        return 0
      } catch {
        if (sequence === quoteSequence.current) setAmount(0)
        return 0
      } finally {
        if (sequence === quoteSequence.current) setCalculating(false)
      }
    },
    [currency.quotaDisplayType, currency.usdExchangeRate]
  )

  // Process payment
  const processPayment = useCallback(
    async (topupAmount: number, paymentType: string) => {
      const request = getPaymentAmountRequest(
        topupAmount,
        paymentType,
        currency.quotaDisplayType,
        currency.usdExchangeRate
      )
      if (
        !request ||
        isWaffoPancakePayment(paymentType) ||
        paymentType === 'waffo'
      ) {
        toast.error(i18next.t('Payment request failed'))
        return false
      }
      try {
        setProcessing(true)

        const isStripe = isStripePayment(paymentType)
        if (!('payment_amount_cny' in request)) return false
        const response = isStripe
          ? await requestStripePayment({
              payment_amount_cny: request.payment_amount_cny,
              payment_method: 'stripe',
            })
          : await requestPayment({
              ...request,
              payment_method: paymentType,
            })

        if (!isApiSuccess(response)) {
          toast.error(response.message || i18next.t('Payment request failed'))
          return false
        }

        // Handle Stripe payment
        if (isStripe && response.data?.pay_link) {
          window.open(response.data.pay_link as string, '_blank')
          toast.success(i18next.t('Redirecting to payment page...'))
          return true
        }

        // Handle non-Stripe payment
        if (!isStripe && response.data) {
          const url = (response as unknown as { url?: string }).url
          if (url) {
            submitPaymentForm(url, response.data)
            toast.success(i18next.t('Redirecting to payment page...'))
            return true
          }
        }

        return false
      } catch {
        toast.error(i18next.t('Payment request failed'))
        return false
      } finally {
        setProcessing(false)
      }
    },
    [currency.quotaDisplayType, currency.usdExchangeRate]
  )

  return {
    amount,
    quote,
    calculating,
    processing,
    calculatePaymentAmount,
    processPayment,
    setAmount,
  }
}
