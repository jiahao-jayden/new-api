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
'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export const TABLE_CELL_TONES = [
  'primary',
  'secondary',
  'tertiary',
  'success',
  'warning',
  'info',
  'neutral',
  'error',
] as const

export type TableCellTone = (typeof TABLE_CELL_TONES)[number]

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div
      data-slot='table-container'
      className='relative w-full overflow-x-auto overflow-y-hidden'
    >
      <table
        data-slot='table'
        className={cn(
          'w-full caption-bottom text-sm tabular-nums [&_td]:text-sm [&_td_*]:text-sm [&_th]:text-xs [&_th_*]:text-xs',
          className
        )}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot='table-header'
      className={cn('[&_tr]:border-0', className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot='table-body'
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot='table-footer'
      className={cn(
        'bg-surface-container-low font-medium [&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot='table-row'
      className={cn(
        'group data-[state=selected]:bg-primary-container border-b transition-colors hover:bg-surface-container-high has-aria-expanded:bg-surface-container-high',
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot='table-head'
      className={cn(
        'text-muted-foreground h-11 px-3 text-left align-middle font-semibold whitespace-nowrap [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
}

type TableCellProps = React.ComponentProps<'td'> & {
  capsule?: boolean
  capsuleClassName?: string
  tone?: TableCellTone
}

function TableCell({
  className,
  capsule,
  capsuleClassName,
  tone,
  children,
  colSpan,
  ...props
}: TableCellProps) {
  const shouldRenderCapsule = capsule ?? (colSpan == null || colSpan === 1)

  return (
    <td
      data-slot='table-cell'
      data-table-tone={tone}
      colSpan={colSpan}
      className={cn(
        'h-12 px-2 py-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    >
      {shouldRenderCapsule ? (
        <div
          data-slot='table-cell-capsule'
          className={cn(
            'inline-flex min-h-8 max-w-full min-w-0 items-center rounded-full px-3 py-1.5 align-middle leading-5',
            capsuleClassName
          )}
        >
          {children}
        </div>
      ) : (
        children
      )}
    </td>
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot='table-caption'
      className={cn('text-muted-foreground mt-4 text-sm', className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
