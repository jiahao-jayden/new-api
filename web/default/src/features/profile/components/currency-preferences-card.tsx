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
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { Coins } from '@/components/game-ui/icons'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldTitle,
} from '@/components/ui/field'
import { TitledCard } from '@/components/ui/titled-card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useAuthStore } from '@/stores/auth-store'
import {
  useCurrencyPreference,
  useCurrencyPreferenceStore,
} from '@/stores/currency-preference-store'

export function CurrencyPreferencesCard() {
  const { t } = useTranslation()
  const labelId = useId()
  const userId = useAuthStore((state) => state.auth.user?.id)
  const currency = useCurrencyPreference()
  const setPreference = useCurrencyPreferenceStore(
    (state) => state.setPreference
  )

  return (
    <TitledCard
      className='game-profile-currency'
      title={t('Display Currency')}
      icon={<Coins className='size-4' />}
      disableHoverEffect
    >
      <FieldGroup>
        <Field orientation='responsive'>
          <div className='min-w-0 flex-1'>
            <FieldTitle id={labelId} className='sr-only'>
              {t('Display Currency')}
            </FieldTitle>
            <FieldDescription>
              {t(
                'Applies only to this account in this browser. Balances and charges are unchanged.'
              )}
            </FieldDescription>
          </div>
          <ToggleGroup
            aria-labelledby={labelId}
            value={[currency]}
            disabled={!userId}
            onValueChange={(values) => {
              const next = values[0]
              if (userId && (next === 'CNY' || next === 'USD')) {
                setPreference(userId, next)
              }
            }}
            variant='outline'
            className='shrink-0'
          >
            <ToggleGroupItem value='CNY'>¥ CNY</ToggleGroupItem>
            <ToggleGroupItem value='USD'>$ USD</ToggleGroupItem>
          </ToggleGroup>
        </Field>
      </FieldGroup>
    </TitledCard>
  )
}
