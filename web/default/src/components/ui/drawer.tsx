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
import { Drawer as DrawerPrimitive } from 'vaul'

import { cn } from '@/lib/utils'

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot='drawer' {...props} />
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot='drawer-trigger' {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot='drawer-portal' {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot='drawer-close' {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot='drawer-overlay'
      className={cn(
        'fixed inset-0 z-50 bg-black/10 transition-[background-color,backdrop-filter] duration-[var(--motion-duration-spatial)] ease-[var(--motion-easing-emphasized)] data-closed:bg-black/0 data-closed:duration-[var(--motion-duration-spatial-exit)] motion-reduce:transition-none supports-backdrop-filter:backdrop-blur-sm data-closed:supports-backdrop-filter:backdrop-blur-none',
        className
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot='drawer-portal'>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot='drawer-content'
        className={cn(
          'group/drawer-content bg-background text-foreground fixed z-50 flex h-auto flex-col overflow-hidden rounded-2xl text-sm shadow-none [--initial-transform:calc(100%+0.75rem)] after:hidden motion-reduce:transition-none sm:[--initial-transform:calc(100%+1rem)] data-[vaul-drawer-direction=bottom]:right-3 data-[vaul-drawer-direction=bottom]:bottom-3 data-[vaul-drawer-direction=bottom]:left-3 data-[vaul-drawer-direction=bottom]:max-h-[calc(100dvh-1.5rem)] data-[vaul-drawer-direction=left]:top-3 data-[vaul-drawer-direction=left]:bottom-3 data-[vaul-drawer-direction=left]:left-3 data-[vaul-drawer-direction=left]:w-[calc(100vw-1.5rem)] data-[vaul-drawer-direction=right]:top-3 data-[vaul-drawer-direction=right]:right-3 data-[vaul-drawer-direction=right]:bottom-3 data-[vaul-drawer-direction=right]:w-[calc(100vw-1.5rem)] data-[vaul-drawer-direction=top]:top-3 data-[vaul-drawer-direction=top]:right-3 data-[vaul-drawer-direction=top]:left-3 data-[vaul-drawer-direction=top]:max-h-[calc(100dvh-1.5rem)] data-[vaul-drawer-direction=bottom]:sm:right-4 data-[vaul-drawer-direction=bottom]:sm:bottom-4 data-[vaul-drawer-direction=bottom]:sm:left-4 data-[vaul-drawer-direction=bottom]:sm:max-h-[calc(100dvh-2rem)] data-[vaul-drawer-direction=left]:sm:top-4 data-[vaul-drawer-direction=left]:sm:bottom-4 data-[vaul-drawer-direction=left]:sm:left-4 data-[vaul-drawer-direction=left]:sm:w-[calc(100vw-2rem)] data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:top-4 data-[vaul-drawer-direction=right]:sm:right-4 data-[vaul-drawer-direction=right]:sm:bottom-4 data-[vaul-drawer-direction=right]:sm:w-[calc(100vw-2rem)] data-[vaul-drawer-direction=right]:sm:max-w-sm data-[vaul-drawer-direction=top]:sm:top-4 data-[vaul-drawer-direction=top]:sm:right-4 data-[vaul-drawer-direction=top]:sm:left-4 data-[vaul-drawer-direction=top]:sm:max-h-[calc(100dvh-2rem)]',
          className
        )}
        {...props}
      >
        <div className='bg-muted mx-auto mt-4 hidden h-1 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block' />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='drawer-header'
      className={cn(
        'flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-0.5 md:text-left',
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='drawer-footer'
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot='drawer-title'
      className={cn('text-foreground text-base font-medium', className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot='drawer-description'
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
