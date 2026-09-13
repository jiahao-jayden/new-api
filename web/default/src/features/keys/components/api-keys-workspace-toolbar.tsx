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
import { useTranslation } from 'react-i18next'

import {
  DataTableToolbar,
  DataTableViewModeToggle,
  DataTableViewOptions,
  type DataTableViewMode,
} from '@/components/data-table'
import { Ellipsis, Search } from '@/components/game-ui/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

import { API_KEY_STATUS_OPTIONS } from '../constants'
import type { ApiKey } from '../types'
import { ApiKeysPrimaryButtons } from './api-keys-primary-buttons'
import { useApiKeys } from './api-keys-provider'

export function ApiKeysWorkspaceToolbar(props: {
  table: Table<ApiKey>
  total: number
  tokenFilterInput: string
  onTokenFilterInputChange: (value: string) => void
  viewMode: DataTableViewMode
  onViewModeChange: (value: DataTableViewMode) => void
  selectionMode: boolean
  onSelectionModeChange: (value: boolean) => void
}) {
  const { t } = useTranslation()
  const { setOpen } = useApiKeys()
  const selectedStatuses = props.table.getColumn('status')?.getFilterValue() as
    | string[]
    | undefined

  return (
    <div className='pencil-key-rack-toolbar'>
      <div className='pencil-key-rack-heading'>
        <h1>
          {t('All keys')} <span>· {props.total}</span>
        </h1>
        <div
          className='pencil-key-rack-search'
          role='search'
          aria-label={t('Filter by name...')}
        >
          <Search className='pencil-key-search-icon' aria-hidden='true' />
          <DataTableToolbar
            className='game-key-search-toolbar'
            table={props.table}
            searchPlaceholder={t('Filter by name...')}
            preActions={<ApiKeysPrimaryButtons />}
            hideViewOptions
          />
        </div>
      </div>
      <div className='pencil-key-rack-filters'>
        <div
          className='pencil-key-status-tabs'
          role='group'
          aria-label={t('Status')}
        >
          <button
            type='button'
            className='game-key-status-filter'
            data-status='all'
            aria-pressed={!selectedStatuses?.length}
            onClick={() =>
              props.table.getColumn('status')?.setFilterValue(undefined)
            }
          >
            {t('All')}
          </button>
          {API_KEY_STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type='button'
              className='game-key-status-filter'
              data-status={option.value}
              aria-pressed={selectedStatuses?.includes(option.value) ?? false}
              onClick={() =>
                props.table.getColumn('status')?.setFilterValue([option.value])
              }
            >
              {option.value === '1' ? t('Key enabled') : t(option.label)}
            </button>
          ))}
        </div>
        <Popover>
          <PopoverTrigger
            render={
              <Button variant='ghost' size='icon-sm' aria-label={t('More')} />
            }
          >
            <Ellipsis className='size-4' />
          </PopoverTrigger>
          <PopoverContent align='end' className='pencil-key-tools-popover'>
            <PopoverTitle>{t('More')}</PopoverTitle>
            <Button variant='outline' onClick={() => setOpen('create-guide')}>
              {t('Create API Key Guide')}
            </Button>
            <label className='flex flex-col gap-2 text-xs'>
              {t('Filter by API key...')}
              <Input
                placeholder={t('Filter by API key...')}
                value={props.tokenFilterInput}
                onChange={(event) =>
                  props.onTokenFilterInputChange(event.target.value)
                }
              />
            </label>
            <div className='flex items-center justify-between gap-3'>
              <DataTableViewModeToggle
                value={props.viewMode}
                onChange={props.onViewModeChange}
              />
              <DataTableViewOptions table={props.table} />
            </div>
            <Button
              variant='outline'
              aria-pressed={props.selectionMode}
              onClick={() => props.onSelectionModeChange(!props.selectionMode)}
            >
              {t('Select keys')}
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
