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
import { createElement, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type SideDrawerSectionTone =
  | 'surface'
  | 'primary'
  | 'secondary'
  | 'tertiary'

const sideDrawerSectionToneClassNames: Record<SideDrawerSectionTone, string> = {
  surface: 'bg-surface-container-low text-foreground',
  primary:
    'bg-primary-container text-primary-container-foreground [&_[data-slot=form-description]]:text-primary-container-foreground/75',
  secondary:
    'bg-secondary-container text-secondary-container-foreground [&_[data-slot=form-description]]:text-secondary-container-foreground/75',
  tertiary:
    'bg-tertiary-container text-tertiary-container-foreground [&_[data-slot=form-description]]:text-tertiary-container-foreground/75',
}

export const sideDrawerContentClassName = (className?: string) =>
  cn(
    'bg-background text-foreground flex h-auto w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden p-0 shadow-none sm:w-[calc(100vw-2rem)]',
    className
  )

export const sideDrawerHeaderClassName = (className?: string) =>
  cn(
    'bg-background px-4 pt-4 pb-2 text-start sm:px-6 sm:pt-5 sm:pb-3',
    className
  )

export const sideDrawerFormClassName = (className?: string) =>
  cn(
    'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 py-3 sm:px-6 sm:py-4',
    className
  )

export const sideDrawerFooterClassName = (className?: string) =>
  cn(
    'bg-background grid grid-cols-2 gap-2 px-4 py-4 sm:flex sm:flex-row sm:justify-end sm:px-6 sm:py-5',
    className
  )

export const sideDrawerSectionClassName = (
  className?: string,
  tone: SideDrawerSectionTone = 'surface'
) =>
  cn(
    'flex flex-col gap-5 rounded-3xl p-4 sm:p-5',
    sideDrawerSectionToneClassNames[tone],
    className
  )

export const sideDrawerSwitchItemClassName = (className?: string) =>
  cn(
    'bg-surface-container-lowest flex min-h-16 flex-row items-center justify-between gap-3 rounded-2xl px-4 py-3',
    className
  )

export function SideDrawerSection(props: {
  children: ReactNode
  className?: string
  tone?: SideDrawerSectionTone
}) {
  return createElement(
    'section',
    { className: sideDrawerSectionClassName(props.className, props.tone) },
    props.children
  )
}

export function SideDrawerSectionHeader(props: {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  className?: string
}) {
  return createElement(
    'div',
    { className: cn('flex items-start gap-3', props.className) },
    props.icon
      ? createElement(
          'span',
          {
            className:
              'mt-0.5 flex size-5 shrink-0 items-center justify-center text-current opacity-80',
          },
          props.icon
        )
      : null,
    createElement(
      'div',
      { className: 'min-w-0 flex-1' },
      createElement(
        'h3',
        { className: 'text-sm leading-none font-semibold tracking-tight' },
        props.title
      ),
      props.description
        ? createElement(
            'p',
            { className: 'text-muted-foreground mt-1 text-xs leading-5' },
            props.description
          )
        : null
    )
  )
}
