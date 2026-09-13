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
import { Main } from '@/components/layout'
import {
  CardStaggerContainer,
  CardStaggerItem,
} from '@/components/page-transition'
import { useStatus } from '@/hooks/use-status'
import { useCurrencyPreference } from '@/stores/currency-preference-store'

import { CheckinCalendarCard } from './components/checkin-calendar-card'
import { CurrencyPreferencesCard } from './components/currency-preferences-card'
import { LanguagePreferencesCard } from './components/language-preferences-card'
import { PasskeyCard } from './components/passkey-card'
import { ProfileHeader } from './components/profile-header'
import { ProfileSecurityCard } from './components/profile-security-card'
import { ProfileSettingsCard } from './components/profile-settings-card'
import { TwoFACard } from './components/two-fa-card'
import { useProfile } from './hooks'

export function Profile() {
  useCurrencyPreference()
  const { profile, loading, refreshProfile } = useProfile()
  const { status } = useStatus()

  const checkinEnabled = status?.checkin_enabled === true
  const turnstileEnabled = !!(
    status?.turnstile_check && status?.turnstile_site_key
  )
  const turnstileSiteKey = status?.turnstile_site_key || ''

  return (
    <Main>
      <div className='pencil-profile-scroll min-h-0 flex-1 overflow-auto p-3 sm:p-4'>
        <CardStaggerContainer className='pencil-profile'>
          <CardStaggerItem className='pencil-profile-identity'>
            <ProfileHeader profile={profile} loading={loading} />
          </CardStaggerItem>

          <CardStaggerItem className='pencil-profile-modules'>
            <div className='pencil-profile-main'>
              <ProfileSettingsCard
                profile={profile}
                loading={loading}
                onProfileUpdate={refreshProfile}
              />
              <div className='pencil-profile-preferences'>
                <LanguagePreferencesCard
                  profile={profile}
                  onProfileUpdate={refreshProfile}
                />
                <CurrencyPreferencesCard />
                <ProfileSecurityCard profile={profile} loading={loading} />
                <PasskeyCard loading={loading} />
                <TwoFACard loading={loading} />
                {checkinEnabled && (
                  <CheckinCalendarCard
                    checkinEnabled={checkinEnabled}
                    turnstileEnabled={turnstileEnabled}
                    turnstileSiteKey={turnstileSiteKey}
                  />
                )}
              </div>
            </div>
          </CardStaggerItem>
        </CardStaggerContainer>
      </div>
    </Main>
  )
}
