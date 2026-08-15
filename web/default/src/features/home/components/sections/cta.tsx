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
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { AnimateInView } from '@/components/animate-in-view'
import { Button } from '@/components/ui/button'

interface CTAProps {
  className?: string
  isAuthenticated?: boolean
}

export function CTA(props: CTAProps) {
  const { t } = useTranslation()

  if (props.isAuthenticated) {
    return null
  }

  return (
    <section className='relative z-10 px-4 py-14 sm:px-6 md:py-20 lg:px-8'>
      <AnimateInView
        className='bg-card mx-auto max-w-6xl rounded-2xl px-6 py-10 text-left sm:px-10'
        animation='scale-in'
      >
        <h2 className='text-2xl leading-tight font-bold md:text-3xl'>
          {t('Ready to simplify')}
          <br />
          <span className='text-primary'>{t('your AI integration?')}</span>
        </h2>
        <p className='text-muted-foreground mt-4 max-w-xl text-sm leading-relaxed md:text-base'>
          {t(
            'Deploy your own gateway and start routing requests through your configured upstream services.'
          )}
        </p>
        <div className='mt-7 flex flex-wrap items-center gap-3'>
          <Button className='group rounded-lg' render={<Link to='/sign-up' />}>
            {t('Get Started')}
            <ArrowRight className='ml-1 size-3.5 transition-transform duration-200 group-hover:translate-x-0.5' />
          </Button>
          <Button variant='outline' render={<Link to='/pricing' />}>
            {t('View Pricing')}
          </Button>
        </div>
      </AnimateInView>
    </section>
  )
}
