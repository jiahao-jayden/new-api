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
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm, type SubmitErrorHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { DateTimePicker } from '@/components/datetime-picker'
import { GameIcon } from '@/components/game-ui/game-icon'
import { ChevronDown, Plus } from '@/components/game-ui/icons'
import { MultiSelect } from '@/components/multi-select'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { getUserModels } from '@/lib/api'
import { getCurrencyDisplay, getCurrencyLabel } from '@/lib/currency'
import { cn } from '@/lib/utils'

import { createApiKey, updateApiKey, getApiKey } from '../api'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants'
import {
  getApiKeyFormSchema,
  type ApiKeyFormValues,
  getApiKeyFormDefaultValues,
  transformFormDataToPayload,
  transformApiKeyToFormDefaults,
} from '../lib'
import type { ApiKey } from '../types'
import { useApiKeys } from './api-keys-provider'

type ApiKeyMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: ApiKey
}

export function ApiKeysMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: ApiKeyMutateDrawerProps) {
  const { t } = useTranslation()
  const isUpdate = !!currentRow
  const { triggerRefresh } = useApiKeys()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  // Fetch models
  const { data: modelsData } = useQuery({
    queryKey: ['user-models'],
    queryFn: getUserModels,
    enabled: open,
    staleTime: 0,
  })

  const models = useMemo(() => modelsData?.data || [], [modelsData?.data])
  const schema = getApiKeyFormSchema(t)

  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getApiKeyFormDefaultValues(),
  })

  // Load existing data when updating
  useEffect(() => {
    if (open && isUpdate && currentRow) {
      getApiKey(currentRow.id)
        .then((result) => {
          if (result.success && result.data) {
            form.reset(transformApiKeyToFormDefaults(result.data))
          }
        })
        .catch(() => {
          toast.error(t(ERROR_MESSAGES.LOAD_FAILED))
        })
    } else if (open && !isUpdate) {
      form.reset(getApiKeyFormDefaultValues())
    }
  }, [open, isUpdate, currentRow, form, t])

  const onSubmit = async (data: ApiKeyFormValues) => {
    setIsSubmitting(true)
    try {
      const basePayload = transformFormDataToPayload(data)

      if (isUpdate && currentRow) {
        const result = await updateApiKey({
          ...basePayload,
          id: currentRow.id,
        })
        if (result.success) {
          toast.success(t(SUCCESS_MESSAGES.API_KEY_UPDATED))
          onOpenChange(false)
          triggerRefresh()
        } else {
          toast.error(result.message || t(ERROR_MESSAGES.UPDATE_FAILED))
        }
      } else {
        // Create mode - handle batch creation
        const count = data.tokenCount || 1
        let successCount = 0

        for (let i = 0; i < count; i++) {
          const result = await createApiKey({
            ...basePayload,
            name:
              i === 0 && data.name
                ? data.name
                : `${data.name || 'default'}-${Math.random().toString(36).slice(2, 8)}`,
          })
          if (result.success) {
            successCount++
          } else {
            toast.error(result.message || t(ERROR_MESSAGES.CREATE_FAILED))
            break
          }
        }

        if (successCount > 0) {
          toast.success(
            t('Successfully created {{count}} API Key(s)', {
              count: successCount,
            })
          )
          onOpenChange(false)
          triggerRefresh()
        }
      }
    } catch {
      toast.error(t(ERROR_MESSAGES.UNEXPECTED))
    } finally {
      setIsSubmitting(false)
    }
  }

  const onInvalid: SubmitErrorHandler<ApiKeyFormValues> = () => {
    toast.error(t('Please fix the highlighted fields before saving'))
  }

  const handleSetExpiry = (months: number, days: number, hours: number) => {
    if (months === 0 && days === 0 && hours === 0) {
      form.setValue('expired_time', undefined)
      return
    }

    const now = new Date()
    now.setMonth(now.getMonth() + months)
    now.setDate(now.getDate() + days)
    now.setHours(now.getHours() + hours)

    form.setValue('expired_time', now)
  }

  const { meta: currencyMeta } = getCurrencyDisplay()
  const currencyLabel = getCurrencyLabel()
  const tokensOnly = currencyMeta.kind === 'tokens'
  const quotaLabel = t('Quota ({{currency}})', { currency: currencyLabel })
  const quotaPlaceholder = tokensOnly
    ? t('Enter quota in tokens')
    : t('Enter quota in {{currency}}', { currency: currencyLabel })
  const unlimitedQuota = form.watch('unlimited_quota')
  let submitLabel = isUpdate ? t('Save changes') : t('Create key')
  if (isSubmitting) submitLabel = t('Saving...')

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) {
          form.reset()
        }
      }}
    >
      <DialogContent
        className={cn('pencil-key-editor', !isUpdate && 'game-key-create')}
      >
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? t('Update API Key') : t('Create key')}
          </DialogTitle>
          <DialogDescription className={!isUpdate ? 'sr-only' : undefined}>
            {isUpdate
              ? t('Update the API key by providing necessary info.')
              : t('Add a new API key by providing necessary info.')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='api-key-form'
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className='pencil-key-editor-form'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='game-key-name-field'>
                  <FormLabel>
                    {!isUpdate && <GameIcon name='pencil' size={32} />}
                    {t('Name')}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('Enter a name')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='pencil-key-editor-pair'>
              <div className='pencil-key-quota-field'>
                <FormField
                  control={form.control}
                  name='remain_quota_dollars'
                  render={({ field }) => (
                    <FormItem className='game-key-quota-amount'>
                      <FormLabel>
                        {!isUpdate && (
                          <GameIcon
                            name='coin-gold-dollar'
                            family='items'
                            size={20}
                          />
                        )}
                        {quotaLabel}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={unlimitedQuota ? '' : field.value}
                          type='number'
                          step={tokensOnly ? 1 : 0.01}
                          disabled={unlimitedQuota}
                          placeholder={
                            unlimitedQuota ? t('Unlimited') : quotaPlaceholder
                          }
                          onChange={(event) =>
                            field.onChange(
                              Number.parseFloat(event.target.value) || 0
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='unlimited_quota'
                  render={({ field }) => (
                    <FormItem className='pencil-key-quota-toggle'>
                      <FormLabel>{t('Unlimited Quota')}</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='expired_time'
                render={({ field }) => (
                  <FormItem className='game-key-expiry-field'>
                    <FormLabel>
                      {!isUpdate && <GameIcon name='calendar' size={20} />}
                      {t('Expiration Time')}
                    </FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('No expiry')}
                        className='game-key-datetime min-w-0 [&_input[type=time]]:w-24'
                      />
                    </FormControl>
                    <div className='pencil-key-expiry-presets'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => handleSetExpiry(0, 0, 0)}
                      >
                        {t('Never')}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => handleSetExpiry(1, 0, 0)}
                      >
                        {t('1 Month')}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => handleSetExpiry(0, 1, 0)}
                      >
                        {t('1 Day')}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => handleSetExpiry(0, 0, 1)}
                      >
                        {t('1 Hour')}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='model_limits'
              render={({ field }) => (
                <FormItem className='game-key-model-field'>
                  <FormLabel>
                    {!isUpdate && <GameIcon name='layer-1' size={20} />}
                    {t('Model Limits')}
                  </FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={models.map((model) => ({
                        label: model,
                        value: model,
                      }))}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder={t('Select models (empty for allow all)')}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('Limit which models can be used with this key')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='allow_ips'
              render={({ field }) => (
                <FormItem className='game-key-access-field'>
                  <FormLabel>
                    {!isUpdate && <GameIcon name='shield' size={20} />}
                    {t('IP allowlist')}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className='pencil-key-ip-field'
                      placeholder={t(
                        'One IP per line (empty for no restriction)'
                      )}
                      rows={2}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'Do not over-trust this feature. IP may be spoofed. Please use with nginx, CDN and other gateways.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isUpdate && (
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger className='pencil-key-advanced-trigger'>
                  <GameIcon name='setting-1' size={20} />
                  {t('Advanced Settings')}
                  <ChevronDown
                    className={cn(
                      'size-3.5 transition-transform',
                      advancedOpen && 'rotate-180'
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <FormField
                    control={form.control}
                    name='tokenCount'
                    render={({ field }) => (
                      <FormItem className='pt-3'>
                        <FormLabel>{t('Quantity')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type='number'
                            min='1'
                            placeholder={t('Number of keys to create')}
                            onChange={(event) =>
                              field.onChange(
                                Number.parseInt(event.target.value, 10) || 1
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            'Create multiple API keys at once (random suffix will be added to names)'
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}
          </form>
        </Form>
        <DialogFooter className='pencil-key-editor-footer'>
          <DialogClose
            render={<Button variant='outline' className='w-full sm:w-auto' />}
          >
            {t('Cancel')}
          </DialogClose>
          <Button
            type='button'
            onClick={form.handleSubmit(onSubmit, onInvalid)}
            disabled={isSubmitting}
            className='game-key-create-action w-full sm:w-auto'
          >
            {!isUpdate && <Plus className='size-3.5' />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
