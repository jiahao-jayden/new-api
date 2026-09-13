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
import { Controller, type Control } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import type { ChannelFormValues } from '../lib/channel-form'

export function ChannelDiscountField(props: {
  control: Control<ChannelFormValues>
  disabled?: boolean
}) {
  const { t } = useTranslation()
  return (
    <FieldGroup>
      <Controller
        control={props.control}
        name='billing_discount'
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='channel-billing-discount'>
              {t('Channel discount (tenths)')}
            </FieldLabel>
            <Input
              ref={field.ref}
              id='channel-billing-discount'
              name={field.name}
              disabled={props.disabled}
              type='number'
              min='0'
              max='10'
              step='any'
              inputMode='decimal'
              aria-invalid={fieldState.invalid}
              aria-describedby='channel-billing-discount-help'
              value={
                Number.isFinite(field.value)
                  ? Number((field.value * 10).toPrecision(12))
                  : ''
              }
              onBlur={field.onBlur}
              onChange={(event) =>
                field.onChange(
                  event.target.value === ''
                    ? Number.NaN
                    : Number(event.target.value) / 10
                )
              }
            />
            <FieldDescription id='channel-billing-discount-help'>
              {t(
                '10 means original price; 3 means 30% of original. Applies to every model on this channel without changing synchronized prices.'
              )}
            </FieldDescription>
            {fieldState.error && (
              <FieldError>
                {t(
                  'Channel discount must be greater than 0 and at most 10 tenths'
                )}
              </FieldError>
            )}
          </Field>
        )}
      />
    </FieldGroup>
  )
}
