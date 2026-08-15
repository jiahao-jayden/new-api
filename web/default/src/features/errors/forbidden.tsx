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
import { useNavigate, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

export function ForbiddenError() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <main className='bg-background flex min-h-svh items-center justify-center px-4 py-12'>
      <section className='bg-card flex w-full max-w-xl flex-col items-center rounded-2xl px-6 py-10 text-center sm:px-10 sm:py-12'>
        <p className='text-primary text-5xl font-semibold tabular-nums'>403</p>
        <h1 className='mt-4 text-xl font-semibold'>{t('Access Forbidden')}</h1>
        <p className='text-muted-foreground mt-2 text-sm leading-relaxed'>
          {t("You don't have necessary permission")} <br />
          {t('to view this resource.')}
        </p>
        <div className='mt-7 grid w-full grid-cols-2 gap-3'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            {t('Go Back')}
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>
            {t('Back to Home')}
          </Button>
        </div>
      </section>
    </main>
  )
}
