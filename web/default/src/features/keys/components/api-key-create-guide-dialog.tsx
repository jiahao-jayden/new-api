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
import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { getUserModels } from '@/lib/api'
import { cn } from '@/lib/utils'

import { createApiKey, fetchTokenKey, searchApiKeys } from '../api'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants'
import {
  getApiKeyFormDefaultValues,
  getGuideModelLimits,
  getGuideName,
  transformFormDataToPayload,
  type ApiKeyCreateGuideSelection,
  type ApiKeyGuideModelFamily,
} from '../lib'

type ApiKeyCreateGuideDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

type GuideOption<T extends string> = {
  value: T
  label: string
}

function GuideCard<T extends string>(props: {
  title: string
  options: GuideOption<T>[]
  value: T | null
  onChange: (value: T) => void
}) {
  return (
    <section className='bg-background ring-border flex min-h-[19rem] flex-col items-center justify-center gap-8 rounded-lg px-5 py-10 shadow-lg ring-1 sm:min-h-[22rem] sm:px-12'>
      <h2 className='text-center text-2xl leading-tight font-semibold tracking-normal sm:text-[1.7rem]'>
        {props.title}
      </h2>
      <div className='flex w-full max-w-[17rem] flex-col gap-5'>
        {props.options.map((option) => {
          const selected = props.value === option.value

          return (
            <Button
              key={option.value}
              type='button'
              variant='secondary'
              onClick={() => props.onChange(option.value)}
              className={cn(
                'bg-muted/60 hover:bg-muted h-16 rounded-md border border-transparent px-5 text-base font-medium shadow-none',
                selected &&
                  'border-primary/35 bg-primary/10 text-primary hover:bg-primary/15'
              )}
            >
              {option.label}
            </Button>
          )
        })}
      </div>
    </section>
  )
}

export function ApiKeyCreateGuideDialog(props: ApiKeyCreateGuideDialogProps) {
  const { t } = useTranslation()
  const [modelFamily, setModelFamily] =
    useState<ApiKeyGuideModelFamily | null>(null)
  const [createdKey, setCreatedKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: modelsData } = useQuery({
    queryKey: ['user-models'],
    queryFn: getUserModels,
    enabled: props.open,
    staleTime: 0,
  })

  const models = useMemo(() => modelsData?.data || [], [modelsData?.data])

  const resetGuide = () => {
    setModelFamily(null)
    setCreatedKey('')
    setIsSubmitting(false)
  }

  const closeGuide = () => {
    props.onOpenChange(false)
    resetGuide()
  }

  const handleModelChange = (value: ApiKeyGuideModelFamily) => {
    setModelFamily(value)
    void createGuidedApiKey(value)
  }

  const createGuidedApiKey = async (
    nextModelFamily: ApiKeyGuideModelFamily
  ) => {
    if (modelsData?.success === false) {
      setModelFamily(null)
      toast.error(modelsData.message || t('Failed to load models'))
      return
    }

    setIsSubmitting(true)
    try {
      const selection: ApiKeyCreateGuideSelection = {
        modelFamily: nextModelFamily,
      }
      const tokenName = `${getGuideName(selection)} ${Date.now().toString(36)}`
      const formValues = {
        ...getApiKeyFormDefaultValues(false),
        name: tokenName,
        group: nextModelFamily === 'openai' ? 'openai' : 'claude',
        cross_group_retry: false,
        model_limits: getGuideModelLimits(selection, models),
      }
      const result = await createApiKey(transformFormDataToPayload(formValues))

      if (!result.success) {
        setModelFamily(null)
        toast.error(result.message || t(ERROR_MESSAGES.CREATE_FAILED))
        return
      }

      const searchResult = await searchApiKeys({
        keyword: tokenName,
        p: 1,
        size: 10,
      })
      const createdToken = searchResult.data?.items.find(
        (token) => token.name === tokenName
      )
      if (!searchResult.success || !createdToken) {
        setModelFamily(null)
        toast.error(searchResult.message || t('Failed to fetch API key'))
        return
      }

      const keyResult = await fetchTokenKey(createdToken.id)
      if (!keyResult.success || !keyResult.data?.key) {
        setModelFamily(null)
        toast.error(keyResult.message || t('Failed to fetch API key'))
        return
      }

      setCreatedKey(keyResult.data.key)
      props.onCreated()
      toast.success(t(SUCCESS_MESSAGES.API_KEY_CREATED))
    } catch {
      setModelFamily(null)
      toast.error(t(ERROR_MESSAGES.UNEXPECTED))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={props.open}
      onOpenChange={(open) => {
        props.onOpenChange(open)
        if (!open) {
          resetGuide()
        }
      }}
    >
      <DialogContent className='bg-transparent ring-0 grid max-h-[calc(100dvh-2rem)] w-full max-w-[36rem] gap-0 overflow-y-auto p-3 shadow-none sm:p-0'>
        <DialogTitle className='sr-only'>{t('Create API Key Guide')}</DialogTitle>
        {!modelFamily && !isSubmitting && (
          <GuideCard
            title={t('Which model do you want to use?')}
            value={modelFamily}
            onChange={handleModelChange}
            options={[
              { value: 'openai', label: t('OpenAI (GPT series)') },
              { value: 'anthropic', label: t('Anthropic (Claude series)') },
            ]}
          />
        )}
        {isSubmitting && !createdKey && (
          <section className='bg-background ring-border flex min-h-[19rem] flex-col items-center justify-center gap-5 rounded-lg px-5 py-10 shadow-lg ring-1 sm:min-h-[22rem] sm:px-12'>
            <Loader2 className='text-primary size-8 animate-spin' />
            <h2 className='text-center text-2xl leading-tight font-semibold tracking-normal sm:text-[1.7rem]'>
              {t('Creating...')}
            </h2>
          </section>
        )}
        {createdKey && (
          <section className='bg-background ring-border flex min-h-[18rem] flex-col items-center justify-center gap-6 rounded-lg px-5 py-9 shadow-lg ring-1 sm:min-h-[20rem] sm:px-14'>
            <div className='flex flex-col items-center gap-3 text-center'>
              <CheckCircle2 className='text-success size-9' />
              <h2 className='text-xl leading-tight font-semibold tracking-normal sm:text-2xl'>
                {t('API Key created successfully')}
              </h2>
            </div>
            <div className='grid w-full max-w-[30rem] gap-2'>
              <label
                className='text-muted-foreground text-xs font-medium'
                htmlFor='created-api-key'
              >
                {t('API key')}
              </label>
              <div className='grid grid-cols-[minmax(0,1fr)_2.75rem] gap-2'>
                <div
                  id='created-api-key'
                  className='border-input bg-muted/30 flex h-11 min-w-0 items-center overflow-x-auto rounded-full border px-4 shadow-none'
                  tabIndex={0}
                >
                  <code className='font-mono text-xs whitespace-nowrap'>
                    {createdKey}
                  </code>
                </div>
                <CopyButton
                  value={createdKey}
                  variant='outline'
                  className='size-11 rounded-full shadow-none'
                  tooltip={t('Copy API key')}
                  aria-label={t('Copy API key')}
                />
              </div>
            </div>
            <div className='flex justify-center'>
              <Button type='button' onClick={closeGuide} className='min-w-24'>
                {t('Done')}
              </Button>
            </div>
          </section>
        )}
      </DialogContent>
    </Dialog>
  )
}
