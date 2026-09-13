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
import type { Table } from '@tanstack/react-table'
import { useState, type ComponentProps, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { DataTableViewOptions } from '@/components/data-table'
import {
  ChevronDown,
  Loader2,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from '@/components/game-ui/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useMediaQuery } from '@/hooks'
import { cn } from '@/lib/utils'

interface LogsFilterToolbarProps<TData> {
  table: Table<TData>
  primaryFilters: ReactNode
  advancedFilters?: ReactNode
  mobilePinnedFilters?: ReactNode
  mobileFilters?: ReactNode
  mobileFilterCount?: number
  stats?: ReactNode
  actionStart?: ReactNode
  hasActiveFilters: boolean
  hasAdvancedActiveFilters?: boolean
  advancedFilterCount?: number
  searchLoading?: boolean
  onReset: () => void
  onSearch: () => void
  className?: string
  workspace?: {
    types: ReactNode
    filters: ReactNode
    advancedFilters?: ReactNode
    advancedFilterCount?: number
    range: ReactNode
  }
}

interface LogsFilterFieldProps {
  children: ReactNode
  wide?: boolean
  className?: string
  label?: string
}

export function LogsFilterField(props: LogsFilterFieldProps) {
  const Tag = props.label ? 'label' : 'div'
  return (
    <Tag
      className={cn(
        'min-w-0 [&_[data-slot=select-trigger]]:w-full [&_[data-slot=select-trigger]]:text-sm [&_[data-slot=select-value]]:leading-5',
        props.wide && 'sm:col-span-2',
        props.className
      )}
    >
      {props.label && (
        <span className='pencil-log-field-label'>{props.label}</span>
      )}
      {props.children}
    </Tag>
  )
}

export function LogsFilterInput(props: ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      className={cn('h-8 min-w-0 text-sm leading-5', props.className)}
    />
  )
}

export function LogsFilterToolbar<TData>(props: LogsFilterToolbarProps<TData>) {
  const { t } = useTranslation()
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 640px)')

  const hasAdvancedFilters = props.advancedFilters != null
  const activeAdvancedCount =
    (!isMobile ? props.workspace?.advancedFilterCount : undefined) ??
    props.advancedFilterCount ??
    (props.hasAdvancedActiveFilters ? 1 : 0)
  const activeMobileFilterCount = props.mobileFilterCount ?? activeAdvancedCount

  const handleMobileReset = () => {
    props.onReset()
    setMobileFiltersOpen(false)
  }

  const handleMobileSearch = () => {
    props.onSearch()
    setMobileFiltersOpen(false)
  }

  const advancedToggle = hasAdvancedFilters ? (
    <Button
      type='button'
      variant='ghost'
      onClick={() => setAdvancedOpen((open) => !open)}
      aria-expanded={advancedOpen}
      className={cn(
        'text-muted-foreground hover:text-foreground gap-1 px-2',
        props.hasAdvancedActiveFilters &&
          !advancedOpen &&
          'text-primary hover:text-primary'
      )}
    >
      {advancedOpen ? t('Collapse') : t('Expand')}
      {activeAdvancedCount > 0 && (
        <Badge className='ml-0.5 size-5 justify-center p-0 text-[10px]'>
          {activeAdvancedCount}
        </Badge>
      )}
      <ChevronDown
        className={cn(
          'size-3.5 transition-transform duration-200',
          advancedOpen && 'rotate-180'
        )}
      />
    </Button>
  ) : null

  if (isMobile && props.mobilePinnedFilters != null) {
    return (
      <Drawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <div
          className={cn(
            'pencil-log-filter-form bg-card/50 rounded-lg border p-2.5',
            props.className
          )}
        >
          <div className='grid gap-2'>{props.mobilePinnedFilters}</div>

          <div className='mt-2 flex flex-col gap-2'>
            {props.stats}
            <div className='flex items-center justify-end gap-1.5'>
              {props.actionStart}
              <DrawerTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  className={cn(
                    'text-muted-foreground hover:text-foreground gap-1 px-2',
                    activeMobileFilterCount > 0 &&
                      'text-primary hover:text-primary'
                  )}
                >
                  {t('Filter')}
                  {activeMobileFilterCount > 0 && (
                    <Badge className='ml-0.5 size-5 justify-center p-0 text-[10px]'>
                      {activeMobileFilterCount}
                    </Badge>
                  )}
                </Button>
              </DrawerTrigger>
              <Button
                type='button'
                onClick={props.onSearch}
                disabled={props.searchLoading}
              >
                {props.searchLoading && <Loader2 className='animate-spin' />}
                {t('Search')}
              </Button>
              <DataTableViewOptions table={props.table} />
            </div>
          </div>
        </div>

        <DrawerContent className='max-h-[85dvh] p-0'>
          <div className='mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden'>
            <DrawerHeader className='border-border/70 border-b px-4 py-3 text-left'>
              <DrawerTitle>{t('Filter')}</DrawerTitle>
              <DrawerDescription>
                {t('Adjust filters, then search to refresh the logs.')}
              </DrawerDescription>
            </DrawerHeader>
            <div className='flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-3'>
              {props.mobileFilters ?? (
                <>
                  {props.primaryFilters}
                  {props.advancedFilters}
                </>
              )}
            </div>
            <DrawerFooter className='border-border/70 grid grid-cols-2 gap-2 border-t px-4 py-3'>
              <Button
                type='button'
                variant='outline'
                onClick={handleMobileReset}
                disabled={!props.hasActiveFilters}
              >
                {t('Reset')}
              </Button>
              <Button
                type='button'
                onClick={handleMobileSearch}
                disabled={props.searchLoading}
              >
                {props.searchLoading && <Loader2 className='animate-spin' />}
                {t('Search')}
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  if (props.workspace) {
    return (
      <div className='game-log-search-area'>
        <section className='game-log-search-panel' aria-label={t('Filter')}>
          <div className='game-log-search-row'>
            <div className='game-log-date'>{props.workspace.range}</div>
            {props.workspace.filters}
            <div className='game-log-search-actions'>
              {advancedToggle}
              <Button
                type='button'
                onClick={props.onSearch}
                disabled={props.searchLoading}
              >
                {props.searchLoading ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  <Search />
                )}
                {t('Search')}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={props.onReset}
                disabled={!props.hasActiveFilters}
              >
                <RotateCcw />
                {t('Reset')}
              </Button>
            </div>
          </div>
          <div
            className='game-log-advanced'
            data-open={advancedOpen}
            inert={!advancedOpen}
          >
            <div>
              <div className='game-log-advanced-fields'>
                {props.workspace.advancedFilters ?? props.advancedFilters}
              </div>
            </div>
          </div>
        </section>
        <div className='game-log-type-bar'>
          {props.workspace.types}
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  aria-label={t('More')}
                />
              }
            >
              <SlidersHorizontal />
            </PopoverTrigger>
            <PopoverContent
              align='end'
              className='pencil-log-tools game-log-tools'
            >
              <div className='pencil-log-tool-actions'>
                {props.actionStart}
                <DataTableViewOptions table={props.table} />
              </div>
              {props.stats}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'pencil-log-filter-form bg-card/50 rounded-lg border p-2.5 sm:p-3',
        props.className
      )}
    >
      <h2 className='pencil-log-filter-title'>{t('Filter')}</h2>
      <div className='pencil-log-filter-primary flex flex-wrap items-start gap-2'>
        <div className='pencil-log-filter-fields grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]'>
          {props.primaryFilters}
        </div>
        {advancedToggle && (
          <div className='flex shrink-0 items-center justify-end'>
            {advancedToggle}
          </div>
        )}
      </div>

      {advancedOpen && props.advancedFilters && (
        <div className='pencil-log-filter-fields mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]'>
          {props.advancedFilters}
        </div>
      )}

      <div className='pencil-log-filter-actions mt-2 flex flex-wrap items-center gap-2'>
        {props.stats}
        <div className='ms-auto flex flex-wrap items-center justify-end gap-1.5 sm:gap-2'>
          {props.actionStart}
          <Button
            type='button'
            variant='outline'
            onClick={props.onReset}
            disabled={!props.hasActiveFilters}
          >
            {t('Reset')}
          </Button>
          <Button
            type='button'
            onClick={props.onSearch}
            disabled={props.searchLoading}
          >
            {props.searchLoading && <Loader2 className='animate-spin' />}
            {t('Search')}
          </Button>
          <DataTableViewOptions table={props.table} />
        </div>
      </div>
    </div>
  )
}
