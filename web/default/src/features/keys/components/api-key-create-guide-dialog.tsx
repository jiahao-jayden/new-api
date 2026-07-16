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
import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from 'motion/react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { getUserModels } from '@/lib/api'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'

import { createApiKey, fetchTokenKey, searchApiKeys } from '../api'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants'
import {
  getApiKeyFormDefaultValues,
  getGuideModelLimits,
  getNextGuideApiKeyName,
  transformFormDataToPayload,
  type ApiKeyCreateGuideSelection,
  type ApiKeyGuideModelFamily,
} from '../lib'

type ApiKeyCreateGuideDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

type GuideStep = 'name' | 'purpose'

const DEFAULT_KEY_NAME = 'Dot-1'
const KEY_NAME_PAGE_SIZE = 100
const MIN_KEY_NAME_UNDERLINE_WIDTH = 48
const KEY_NAME_UNDERLINE_PADDING = 8
const GUIDE_NAME_TEXT_CLASS =
  'text-xl leading-none font-normal tracking-normal sm:text-2xl md:text-2xl'

const GUIDE_STEP_VARIANTS: Variants = {
  enter: (direction: number) => ({
    x: direction * 28,
    opacity: 0,
    filter: 'blur(6px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction: number) => ({
    x: direction * -28,
    opacity: 0,
    filter: 'blur(6px)',
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  }),
}

const GUIDE_RESULT_VARIANTS: Variants = {
  enter: {
    y: 14,
    opacity: 0,
  },
  center: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    y: -12,
    opacity: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
}

function GuideProgress(props: { current: 1 | 2 }) {
  return (
    <div
      className='flex items-center gap-2'
      aria-label={`${props.current} / 2`}
    >
      {[1, 2].map((step) => (
        <span
          key={step}
          aria-hidden='true'
          className={
            step <= props.current
              ? 'bg-foreground h-1 w-7 rounded-full'
              : 'bg-muted h-1 w-7 rounded-full'
          }
        />
      ))}
    </div>
  )
}

function GuidePanel(props: { children: React.ReactNode }) {
  return (
    <section className='bg-popover text-popover-foreground flex max-h-[calc(100dvh-2rem)] min-h-[min(26rem,calc(100dvh-2rem))] flex-col overflow-y-auto rounded-2xl px-6 py-7 shadow-[0_1.5rem_4rem_-1.5rem_rgb(0_0_0/0.32)] ring-1 ring-black/8 sm:px-12 sm:py-8 dark:ring-white/10'>
      {props.children}
    </section>
  )
}

function GuideHeader(props: {
  title: string
  currentStep?: 1 | 2
  singleLine?: boolean
}) {
  return (
    <header className='flex flex-col items-center text-center'>
      {props.currentStep && <GuideProgress current={props.currentStep} />}
      <h2
        className={`mt-6 max-w-[36rem] text-xl leading-[1.25] font-normal tracking-normal text-balance sm:text-2xl ${props.singleLine ? 'sm:whitespace-nowrap' : ''}`}
      >
        {props.title}
      </h2>
    </header>
  )
}

function GuidePrimaryAction(props: {
  label: string
  expanded: boolean
  expandedWidth?: string
  shouldReduceMotion: boolean
  disabled?: boolean
  showChevron?: boolean
  type?: 'button' | 'submit'
  onClick?: () => void
}) {
  return (
    <motion.div
      initial={false}
      animate={{
        width: props.expanded ? (props.expandedWidth ?? '100%') : '8rem',
      }}
      transition={
        props.shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
      }
      className='flex min-w-0 justify-center'
    >
      <Button
        type={props.type ?? 'button'}
        size='lg'
        disabled={props.disabled}
        onClick={props.onClick}
        className='h-11 w-full min-w-0 overflow-hidden rounded-xl px-5 text-base font-normal whitespace-nowrap transition-colors'
      >
        {props.label}
        {props.showChevron && <ChevronRight aria-hidden='true' />}
      </Button>
    </motion.div>
  )
}

function GuideNameInput(props: {
  value: string
  label: string
  invalid: boolean
  errorMessage: string
  shouldReduceMotion: boolean
  onValueChange: (value: string) => void
}) {
  const fieldRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [underlineWidth, setUnderlineWidth] = useState(
    MIN_KEY_NAME_UNDERLINE_WIDTH
  )

  useLayoutEffect(() => {
    const fieldElement = fieldRef.current
    const measureElement = measureRef.current
    if (!fieldElement || !measureElement) return

    const updateUnderlineWidth = () => {
      const availableWidth = Math.floor(
        fieldElement.getBoundingClientRect().width
      )
      if (availableWidth <= 0) return

      const measuredWidth = Math.ceil(
        measureElement.getBoundingClientRect().width
      )
      const nextWidth = Math.min(
        Math.max(
          measuredWidth + KEY_NAME_UNDERLINE_PADDING,
          MIN_KEY_NAME_UNDERLINE_WIDTH
        ),
        availableWidth
      )
      setUnderlineWidth((currentWidth) =>
        currentWidth === nextWidth ? currentWidth : nextWidth
      )
    }

    updateUnderlineWidth()
    const resizeObserver = new ResizeObserver(updateUnderlineWidth)
    resizeObserver.observe(fieldElement)
    resizeObserver.observe(measureElement)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div
      ref={fieldRef}
      className='group relative flex w-full flex-col items-center'
    >
      <label htmlFor='guided-api-key-name' className='sr-only'>
        {props.label}
      </label>
      <span
        ref={measureRef}
        aria-hidden='true'
        className={cn(
          GUIDE_NAME_TEXT_CLASS,
          'pointer-events-none absolute w-max max-w-none invisible whitespace-pre'
        )}
      >
        {props.value || '\u200B'}
      </span>
      <Input
        id='guided-api-key-name'
        autoFocus
        autoComplete='off'
        maxLength={50}
        value={props.value}
        aria-invalid={props.invalid}
        aria-describedby='guided-api-key-name-error'
        onChange={(event) => props.onValueChange(event.target.value)}
        className={cn(
          GUIDE_NAME_TEXT_CLASS,
          'h-14 rounded-none border-0 bg-transparent px-0 py-0 text-center shadow-none outline-none focus-visible:border-transparent focus-visible:ring-0 aria-invalid:border-transparent aria-invalid:ring-0 dark:bg-transparent dark:aria-invalid:border-transparent dark:aria-invalid:ring-0'
        )}
      />
      <div className='flex h-0.5 w-full justify-center'>
        <motion.span
          aria-hidden='true'
          initial={false}
          animate={{ width: underlineWidth }}
          transition={
            props.shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
          }
          className={cn(
            'bg-border group-focus-within:bg-foreground/70 h-px rounded-full transition-colors duration-200',
            props.invalid && 'bg-destructive group-focus-within:bg-destructive'
          )}
        />
      </div>
      <p
        id='guided-api-key-name-error'
        role='alert'
        className='text-destructive mt-2 min-h-5 text-center text-sm leading-5'
      >
        {props.invalid ? props.errorMessage : null}
      </p>
    </div>
  )
}

function SuccessCheckmark(props: { shouldReduceMotion: boolean }) {
  return (
    <motion.svg
      viewBox='0 0 24 24'
      aria-hidden='true'
      className='text-success size-14'
      fill='none'
    >
      <motion.circle
        cx='12'
        cy='12'
        r='9.5'
        stroke='currentColor'
        strokeWidth='1.8'
        initial={
          props.shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }
        }
        animate={{ pathLength: 1, opacity: 1 }}
        transition={
          props.shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.36, ease: [0.22, 1, 0.36, 1] }
        }
      />
      <motion.path
        d='M7.5 12.5 10.7 15.7 17 9.4'
        stroke='currentColor'
        strokeWidth='2.2'
        strokeLinecap='round'
        strokeLinejoin='round'
        initial={
          props.shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }
        }
        animate={{ pathLength: 1, opacity: 1 }}
        transition={
          props.shouldReduceMotion
            ? { duration: 0 }
            : { delay: 0.18, duration: 0.26, ease: [0.22, 1, 0.36, 1] }
        }
      />
    </motion.svg>
  )
}

export function ApiKeyCreateGuideDialog(props: ApiKeyCreateGuideDialogProps) {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const [step, setStep] = useState<GuideStep>('name')
  const [navigationDirection, setNavigationDirection] = useState<1 | -1>(1)
  const [apiKeyName, setApiKeyName] = useState(DEFAULT_KEY_NAME)
  const [nameEdited, setNameEdited] = useState(false)
  const [showNameError, setShowNameError] = useState(false)
  const [modelFamily, setModelFamily] = useState<ApiKeyGuideModelFamily | null>(
    null
  )
  const [createdKey, setCreatedKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: modelsData } = useQuery({
    queryKey: ['user-models'],
    queryFn: getUserModels,
    enabled: props.open,
    staleTime: 0,
  })

  const { data: suggestedName } = useQuery({
    queryKey: ['api-key-guide-suggested-name'],
    enabled: props.open,
    staleTime: 0,
    queryFn: async () => {
      const firstPage = await searchApiKeys({
        keyword: 'Dot-%',
        p: 1,
        size: KEY_NAME_PAGE_SIZE,
      })
      if (!firstPage.success || !firstPage.data) {
        return DEFAULT_KEY_NAME
      }

      const names = firstPage.data.items.map((token) => token.name)
      const pageCount = Math.ceil(firstPage.data.total / KEY_NAME_PAGE_SIZE)

      if (pageCount > 1) {
        const remainingPages = await Promise.all(
          Array.from({ length: pageCount - 1 }, (_, index) =>
            searchApiKeys({
              keyword: 'Dot-%',
              p: index + 2,
              size: KEY_NAME_PAGE_SIZE,
            })
          )
        )

        for (const page of remainingPages) {
          if (!page.success || !page.data) continue
          names.push(...page.data.items.map((token) => token.name))
        }
      }

      return getNextGuideApiKeyName(names)
    },
  })

  const models = useMemo(() => modelsData?.data || [], [modelsData?.data])

  useEffect(() => {
    if (!props.open || nameEdited || !suggestedName) return
    setApiKeyName(suggestedName)
  }, [nameEdited, props.open, suggestedName])

  const resetGuide = () => {
    setStep('name')
    setNavigationDirection(1)
    setApiKeyName(DEFAULT_KEY_NAME)
    setNameEdited(false)
    setShowNameError(false)
    setModelFamily(null)
    setCreatedKey('')
    setIsSubmitting(false)
  }

  const closeGuide = () => {
    props.onOpenChange(false)
    resetGuide()
  }

  const handleNameContinue = () => {
    const trimmedName = apiKeyName.trim()

    if (!trimmedName) {
      setShowNameError(true)
      return
    }

    setApiKeyName(trimmedName)
    setShowNameError(false)
    setNavigationDirection(1)
    setStep('purpose')
  }

  const handleNameSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleNameContinue()
  }

  const handleModelChange = (value: ApiKeyGuideModelFamily) => {
    setModelFamily(value)
  }

  const handleCreate = () => {
    if (!modelFamily) return
    void createGuidedApiKey(modelFamily)
  }

  const createGuidedApiKey = async (
    nextModelFamily: ApiKeyGuideModelFamily
  ) => {
    const tokenName = apiKeyName.trim()
    if (!tokenName) {
      setStep('name')
      setShowNameError(true)
      setModelFamily(null)
      return
    }

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
        if (!open) resetGuide()
      }}
    >
      <DialogContent className='[&_[data-slot=dialog-close]]:bg-muted/70 [&_[data-slot=dialog-close]]:hover:bg-muted grid max-h-[calc(100dvh-2rem)] w-full max-w-[34rem] gap-0 overflow-visible rounded-none bg-transparent p-3 shadow-none ring-0 sm:max-w-[34rem] sm:p-0 [&_[data-slot=dialog-close]]:top-6 [&_[data-slot=dialog-close]]:right-6 [&_[data-slot=dialog-close]]:rounded-full sm:[&_[data-slot=dialog-close]]:top-5 sm:[&_[data-slot=dialog-close]]:right-5'>
        <DialogTitle className='sr-only'>
          {t('Create API Key Guide')}
        </DialogTitle>

        {!isSubmitting && !createdKey && (
          <GuidePanel>
            <AnimatePresence
              mode='popLayout'
              initial={false}
              custom={navigationDirection}
            >
              {step === 'name' ? (
                <motion.div
                  key='name'
                  custom={navigationDirection}
                  variants={GUIDE_STEP_VARIANTS}
                  initial={shouldReduceMotion ? false : 'enter'}
                  animate='center'
                  exit={shouldReduceMotion ? undefined : 'exit'}
                  className='flex min-h-0 flex-1 flex-col'
                >
                  <GuideHeader
                    title={t('Give your API key a name')}
                    currentStep={1}
                    singleLine
                  />

                  <form
                    className='flex flex-1 flex-col items-center'
                    onSubmit={handleNameSubmit}
                  >
                    <div className='flex w-full flex-1 items-center justify-center pt-6'>
                      <div className='w-full max-w-[28rem]'>
                        <GuideNameInput
                          value={apiKeyName}
                          label={t('Name')}
                          invalid={showNameError}
                          errorMessage={t('Please enter a name')}
                          shouldReduceMotion={!!shouldReduceMotion}
                          onValueChange={(value) => {
                            setApiKeyName(value)
                            setNameEdited(true)
                            if (value.trim()) setShowNameError(false)
                          }}
                        />
                      </div>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key='purpose'
                  custom={navigationDirection}
                  variants={GUIDE_STEP_VARIANTS}
                  initial={shouldReduceMotion ? false : 'enter'}
                  animate='center'
                  exit={shouldReduceMotion ? undefined : 'exit'}
                  className='flex min-h-0 flex-1 flex-col'
                >
                  <GuideHeader
                    title={t('What model would you like to use?')}
                    currentStep={2}
                    singleLine
                  />

                  <div className='flex min-h-0 flex-1 flex-col items-center pt-7'>
                    <div className='grid w-full max-w-[28rem] gap-3'>
                      {[
                        {
                          value: 'openai' as const,
                          label: t('OpenAI (GPT series)'),
                          icon: 'OpenAI.Color',
                        },
                        {
                          value: 'anthropic' as const,
                          label: t('Anthropic (Claude series)'),
                          icon: 'Claude.Color',
                        },
                      ].map((option) => {
                        const selected = modelFamily === option.value

                        return (
                          <Button
                            key={option.value}
                            type='button'
                            variant='outline'
                            aria-pressed={selected}
                            onClick={() => handleModelChange(option.value)}
                            className={cn(
                              'bg-background hover:bg-muted/70 h-[4.25rem] w-full justify-between rounded-xl px-4 text-base font-medium shadow-none',
                              selected &&
                                'border-primary/40 bg-primary/5 hover:bg-primary/10'
                            )}
                          >
                            <span className='flex min-w-0 items-center gap-3.5'>
                              <span
                                className='bg-muted/60 flex size-9 shrink-0 items-center justify-center rounded-lg'
                                aria-hidden='true'
                              >
                                {getLobeIcon(option.icon, 22)}
                              </span>
                              <span className='truncate'>{option.label}</span>
                            </span>
                            <ChevronRight
                              aria-hidden='true'
                              className='text-muted-foreground size-4'
                            />
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className='mt-auto flex w-full max-w-[28rem] items-center justify-center gap-3 pt-7'>
              {step === 'purpose' && (
                <Button
                  type='button'
                  variant='ghost'
                  size='lg'
                  onClick={() => {
                    setModelFamily(null)
                    setNavigationDirection(-1)
                    setStep('name')
                  }}
                  className='h-11 shrink-0 rounded-xl px-3 text-base font-medium'
                >
                  <ArrowLeft aria-hidden='true' />
                  {t('Back')}
                </Button>
              )}
              <GuidePrimaryAction
                label={step === 'name' ? t('Continue') : t('Finish creating')}
                expanded={step === 'purpose'}
                expandedWidth='22.25rem'
                shouldReduceMotion={!!shouldReduceMotion}
                disabled={step === 'purpose' && !modelFamily}
                showChevron={step === 'name'}
                onClick={step === 'name' ? handleNameContinue : handleCreate}
              />
            </div>
          </GuidePanel>
        )}

        {(isSubmitting || createdKey) && (
          <GuidePanel>
            <AnimatePresence mode='wait' initial={false}>
              {createdKey ? (
                <motion.div
                  key='success'
                  variants={GUIDE_RESULT_VARIANTS}
                  initial={shouldReduceMotion ? false : 'enter'}
                  animate='center'
                  exit={shouldReduceMotion ? undefined : 'exit'}
                  className='flex flex-1 flex-col'
                >
                  <div className='flex flex-col items-center px-7 text-center'>
                    <SuccessCheckmark
                      shouldReduceMotion={!!shouldReduceMotion}
                    />
                    <div className='mt-5 min-w-0'>
                      <h2 className='text-2xl leading-[1.25] font-medium tracking-normal text-balance'>
                        {t('API Key created successfully')}
                      </h2>
                      <p className='text-muted-foreground mt-2 truncate text-base leading-6'>
                        {apiKeyName}
                      </p>
                    </div>
                  </div>

                  <div className='flex flex-1 flex-col items-center pt-8'>
                    <div className='grid w-full max-w-[28rem] gap-2.5'>
                      <label
                        className='text-center text-sm leading-5 font-medium'
                        htmlFor='created-api-key'
                      >
                        {t('API key')}
                      </label>
                      <div className='grid grid-cols-[minmax(0,1fr)_3rem] gap-2.5'>
                        <div
                          id='created-api-key'
                          className='border-input bg-background no-scrollbar flex h-12 min-w-0 items-center justify-center overflow-x-auto overflow-y-hidden rounded-xl border px-4 text-center shadow-none'
                          tabIndex={0}
                        >
                          <code className='font-mono text-sm leading-5 whitespace-nowrap'>
                            {createdKey}
                          </code>
                        </div>
                        <CopyButton
                          value={createdKey}
                          variant='outline'
                          className='size-12 rounded-xl shadow-none'
                          tooltip={t('Copy API key')}
                          aria-label={t('Copy API key')}
                        />
                      </div>
                    </div>

                    <div className='mt-auto flex w-full max-w-[28rem] justify-center pt-6'>
                      <Button
                        type='button'
                        size='lg'
                        onClick={closeGuide}
                        className='h-11 w-full rounded-xl px-5 text-base font-medium'
                      >
                        {t('Done')}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key='creating'
                  variants={GUIDE_RESULT_VARIANTS}
                  initial={shouldReduceMotion ? false : 'enter'}
                  animate='center'
                  exit={shouldReduceMotion ? undefined : 'exit'}
                  className='flex flex-1 flex-col items-center justify-center gap-5 text-center'
                  aria-live='polite'
                  aria-busy='true'
                >
                  <span className='bg-muted flex size-12 items-center justify-center rounded-full'>
                    <Loader2
                      aria-hidden='true'
                      className='text-foreground size-5 animate-spin motion-reduce:animate-none'
                    />
                  </span>
                  <div className='grid gap-2'>
                    <h2 className='text-2xl leading-[1.2] font-medium tracking-normal'>
                      {t('Creating...')}
                    </h2>
                    <p className='text-muted-foreground text-base leading-6'>
                      {apiKeyName}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GuidePanel>
        )}
      </DialogContent>
    </Dialog>
  )
}
