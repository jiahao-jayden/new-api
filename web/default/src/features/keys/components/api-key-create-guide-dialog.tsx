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
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
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
  type ApiKeyGuideUseCase,
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
  onBack?: () => void
}) {
  const { t } = useTranslation()

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
      {props.onBack && (
        <Button type='button' variant='ghost' onClick={props.onBack}>
          <ArrowLeft className='size-4' />
          {t('Back')}
        </Button>
      )}
    </section>
  )
}

export function ApiKeyCreateGuideDialog(props: ApiKeyCreateGuideDialogProps) {
  const { t } = useTranslation()
  const [modelFamily, setModelFamily] =
    useState<ApiKeyGuideModelFamily | null>(null)
  const [useCase, setUseCase] = useState<ApiKeyGuideUseCase | null>(null)
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
    setUseCase(null)
    setCreatedKey('')
    setIsSubmitting(false)
  }

  const closeGuide = () => {
    props.onOpenChange(false)
    resetGuide()
  }

  const handleModelChange = (value: ApiKeyGuideModelFamily) => {
    setModelFamily(value)
  }

  const handleUseCaseChange = (value: ApiKeyGuideUseCase) => {
    if (!modelFamily) return
    setUseCase(value)
    void createGuidedApiKey(modelFamily, value)
  }

  const resolveGuideGroup = (
    nextModelFamily: ApiKeyGuideModelFamily,
    nextUseCase: ApiKeyGuideUseCase
  ) => {
    if (nextModelFamily === 'openai' || nextUseCase === 'third-party') {
      return 'openai'
    }
    return 'claude'
  }

  const createGuidedApiKey = async (
    nextModelFamily: ApiKeyGuideModelFamily,
    nextUseCase: ApiKeyGuideUseCase
  ) => {
    if (modelsData?.success === false) {
      setUseCase(null)
      toast.error(modelsData.message || t('Failed to load models'))
      return
    }

    setIsSubmitting(true)
    try {
      const selection: ApiKeyCreateGuideSelection = {
        modelFamily: nextModelFamily,
        useCase: nextUseCase,
      }
      const tokenName = `${getGuideName(selection)} ${Date.now().toString(36)}`
      const formValues = {
        ...getApiKeyFormDefaultValues(false),
        name: tokenName,
        group: resolveGuideGroup(nextModelFamily, nextUseCase),
        cross_group_retry: false,
        model_limits: getGuideModelLimits(selection, models),
      }
      const result = await createApiKey(transformFormDataToPayload(formValues))

      if (!result.success) {
        setUseCase(null)
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
        setUseCase(null)
        toast.error(searchResult.message || t('Failed to fetch API key'))
        return
      }

      const keyResult = await fetchTokenKey(createdToken.id)
      if (!keyResult.success || !keyResult.data?.key) {
        setUseCase(null)
        toast.error(keyResult.message || t('Failed to fetch API key'))
        return
      }

      setCreatedKey(keyResult.data.key)
      props.onCreated()
      toast.success(t(SUCCESS_MESSAGES.API_KEY_CREATED))
    } catch {
      setUseCase(null)
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
      <DialogContent className='bg-transparent ring-0 grid max-h-[calc(100dvh-2rem)] w-full max-w-[32rem] gap-0 overflow-y-auto p-3 shadow-none sm:p-0'>
        <DialogTitle className='sr-only'>{t('Create API Key Guide')}</DialogTitle>
        {!modelFamily && (
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
        {modelFamily && !useCase && !isSubmitting && (
          <GuideCard
            title={t('What do you want to use it for?')}
            value={useCase}
            onChange={handleUseCaseChange}
            onBack={() => setModelFamily(null)}
            options={[
              { value: 'third-party', label: t('Connect my third-party app') },
              { value: 'vibe-coding', label: t('For Vibe Coding') },
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
          <section className='bg-background ring-border flex min-h-[19rem] flex-col gap-8 rounded-lg px-5 py-10 shadow-lg ring-1 sm:min-h-[22rem] sm:px-12'>
            <div className='flex flex-col items-center gap-4 text-center'>
              <CheckCircle2 className='text-success size-10' />
              <h2 className='text-2xl leading-tight font-semibold tracking-normal sm:text-[1.7rem]'>
                {t('API Key created successfully')}
              </h2>
            </div>
            <div className='grid gap-2'>
              <label className='text-sm font-medium' htmlFor='created-api-key'>
                {t('API key')}
              </label>
              <div className='flex gap-2'>
                <Input
                  id='created-api-key'
                  readOnly
                  value={createdKey}
                  className='font-mono text-xs'
                />
                <CopyButton
                  value={createdKey}
                  variant='outline'
                  tooltip={t('Copy API key')}
                  aria-label={t('Copy API key')}
                />
              </div>
            </div>
            <div className='flex justify-end'>
              <Button type='button' onClick={closeGuide}>
                {t('Done')}
              </Button>
            </div>
          </section>
        )}
      </DialogContent>
    </Dialog>
  )
}
