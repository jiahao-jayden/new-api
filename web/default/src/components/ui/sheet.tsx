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

import { Dialog as SheetPrimitive } from '@base-ui/react/dialog'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot='sheet' {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot='sheet-trigger' {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot='sheet-close' {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot='sheet-portal' {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot='sheet-overlay'
      className={cn(
        'fixed inset-0 z-50 bg-black/10 transition-[opacity,background-color,backdrop-filter] duration-[var(--motion-duration-spatial)] ease-[var(--motion-easing-emphasized)] data-ending-style:bg-black/0 data-ending-style:opacity-0 data-ending-style:duration-[var(--motion-duration-spatial-exit)] data-starting-style:bg-black/0 data-starting-style:opacity-0 motion-reduce:transition-none supports-backdrop-filter:backdrop-blur-sm data-ending-style:supports-backdrop-filter:backdrop-blur-none data-starting-style:supports-backdrop-filter:backdrop-blur-none',
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: 'top' | 'right' | 'bottom' | 'left'
  showCloseButton?: boolean
}) {
  // Side-specific classes are emitted via JS conditionals (rather than
  // `data-[side=*]:` variants) so consumer-provided width overrides such as
  // `sm:max-w-2xl` can be correctly merged by `tailwind-merge` and the CSS
  // cascade — the data-attribute variants would otherwise win on specificity
  // and trap the panel at the default `sm:max-w-sm` width.
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot='sheet-content'
        data-side={side}
        className={cn(
          'bg-background text-foreground fixed z-50 flex flex-col gap-4 overflow-hidden rounded-2xl bg-clip-padding text-sm shadow-none transition-[opacity,translate] duration-[var(--motion-duration-spatial)] ease-[var(--motion-easing-emphasized)] data-ending-style:opacity-0 data-ending-style:duration-[var(--motion-duration-spatial-exit)] data-starting-style:opacity-0 motion-reduce:transition-none',
          side === 'right' &&
            'top-3 right-3 bottom-3 h-auto w-[calc(100vw-1.5rem)] data-ending-style:translate-x-[calc(100%+0.75rem)] data-starting-style:translate-x-[calc(100%+0.75rem)] sm:top-4 sm:right-4 sm:bottom-4 sm:w-[calc(100vw-2rem)] sm:max-w-sm sm:data-ending-style:translate-x-[calc(100%+1rem)] sm:data-starting-style:translate-x-[calc(100%+1rem)]',
          side === 'left' &&
            'top-3 bottom-3 left-3 h-auto w-[calc(100vw-1.5rem)] data-ending-style:translate-x-[calc(-100%-0.75rem)] data-starting-style:translate-x-[calc(-100%-0.75rem)] sm:top-4 sm:bottom-4 sm:left-4 sm:w-[calc(100vw-2rem)] sm:max-w-sm sm:data-ending-style:translate-x-[calc(-100%-1rem)] sm:data-starting-style:translate-x-[calc(-100%-1rem)]',
          side === 'top' &&
            'top-3 right-3 left-3 h-auto max-h-[calc(100dvh-1.5rem)] w-auto data-ending-style:translate-y-[calc(-100%-0.75rem)] data-starting-style:translate-y-[calc(-100%-0.75rem)] sm:top-4 sm:right-4 sm:left-4 sm:max-h-[calc(100dvh-2rem)] sm:data-ending-style:translate-y-[calc(-100%-1rem)] sm:data-starting-style:translate-y-[calc(-100%-1rem)]',
          side === 'bottom' &&
            'right-3 bottom-3 left-3 h-auto max-h-[calc(100dvh-1.5rem)] w-auto data-ending-style:translate-y-[calc(100%+0.75rem)] data-starting-style:translate-y-[calc(100%+0.75rem)] sm:right-4 sm:bottom-4 sm:left-4 sm:max-h-[calc(100dvh-2rem)] sm:data-ending-style:translate-y-[calc(100%+1rem)] sm:data-starting-style:translate-y-[calc(100%+1rem)]',
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot='sheet-close'
            render={
              <Button
                variant='ghost'
                className='absolute top-3 right-3'
                size='icon-sm'
              />
            }
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
            <span className='sr-only'>Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-header'
      className={cn('flex flex-col gap-0.5 p-4', className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-footer'
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot='sheet-title'
      className={cn('text-foreground text-base font-medium', className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot='sheet-description'
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
