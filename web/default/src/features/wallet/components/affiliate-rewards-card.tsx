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
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { Users } from '@/components/game-ui/icons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatQuota } from '@/lib/format'

import type { UserWalletData } from '../types'

interface AffiliateRewardsCardProps {
  user: UserWalletData | null
  affiliateLink: string
  onTransfer: () => void
  complianceConfirmed?: boolean
  loading?: boolean
}

export function AffiliateRewardsCard(props: AffiliateRewardsCardProps) {
  const { t } = useTranslation()
  if (props.loading) {
    return (
      <Card
        data-card-hover='false'
        className='pencil-wallet-affiliate'
        aria-busy='true'
      >
        <CardHeader>
          <Skeleton className='h-5 w-32' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-20 w-full' />
          <Skeleton className='h-12 w-full' />
          <Skeleton className='h-14 w-full' />
        </CardContent>
        <CardFooter>
          <Skeleton className='h-10 w-full' />
        </CardFooter>
      </Card>
    )
  }

  const hasRewards = (props.user?.aff_quota ?? 0) > 0
  const complianceConfirmed = props.complianceConfirmed ?? true

  return (
    <Card data-card-hover='false' className='pencil-wallet-affiliate'>
      <CardHeader>
        <Users className='size-5' aria-hidden='true' />
        <CardTitle>
          <h3>{t('Referral Program')}</h3>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <dl className='pencil-referral-rewards'>
          <div className='pencil-referral-pending'>
            <dt>{t('Pending')}</dt>
            <dd>{formatQuota(props.user?.aff_quota ?? 0)}</dd>
          </div>
          <div className='pencil-referral-total' data-reward-stat='earned'>
            <dt>{t('Total Earned')}</dt>
            <dd>{formatQuota(props.user?.aff_history_quota ?? 0)}</dd>
          </div>
          <div className='pencil-referral-total' data-reward-stat='invites'>
            <dt>{t('Invites')}</dt>
            <dd>{String(props.user?.aff_count ?? 0)}</dd>
          </div>
        </dl>
        <p className='pencil-referral-description'>
          {t(
            'Earn rewards when your referrals add funds. Transfer accumulated rewards to your balance anytime.'
          )}
        </p>
      </CardContent>

      <CardFooter>
        <code className='pencil-referral-link'>{props.affiliateLink}</code>
        <CopyButton
          value={props.affiliateLink}
          variant='default'
          size='default'
          className='pencil-referral-copy'
          iconClassName='size-4'
          aria-label={t('Copy referral link')}
        >
          {t('Copy referral link')}
        </CopyButton>
        {hasRewards && (
          <Button
            onClick={props.onTransfer}
            disabled={!complianceConfirmed}
            variant='outline'
            className='pencil-referral-transfer'
          >
            {t('Transfer to Balance')}
          </Button>
        )}
        {!complianceConfirmed ? (
          <p className='pencil-referral-description'>
            {t(
              'Referral reward transfer is disabled until the administrator confirms compliance terms.'
            )}
          </p>
        ) : null}
      </CardFooter>
    </Card>
  )
}
