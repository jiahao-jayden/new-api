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
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import type { Table as TanstackTable } from '@tanstack/react-table'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
  DISABLED_ROW_DESKTOP,
  DataTablePage,
  useDataTableViewMode,
  useDebouncedColumnFilter,
  useDataTable,
} from '@/components/data-table'
import { Database } from '@/components/game-ui/icons'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { useMediaQuery } from '@/hooks'
import { useTableUrlState } from '@/hooks/use-table-url-state'

import { getApiKeys, searchApiKeys } from '../api'
import { API_KEY_STATUS, ERROR_MESSAGES } from '../constants'
import type { ApiKey } from '../types'
import {
  ApiKeyInspector,
  ApiKeyRecentPanel,
  ApiKeyWorkspaceCard,
} from './api-key-workspace'
import { useApiKeysColumns } from './api-keys-columns'
import { useApiKeys } from './api-keys-provider'
import { ApiKeysWorkspaceToolbar } from './api-keys-workspace-toolbar'
import { DataTableBulkActions } from './data-table-bulk-actions'

const route = getRouteApi('/_authenticated/keys/')
const API_KEYS_COLUMN_VISIBILITY_STORAGE_KEY = 'api-keys:column-visibility'

function isDisabledApiKeyRow(apiKey: ApiKey) {
  return apiKey.status !== API_KEY_STATUS.ENABLED
}

function ApiKeysMobileSkeleton() {
  return (
    <div className='divide-border overflow-hidden rounded-lg border'>
      {['first', 'second', 'third', 'fourth', 'fifth'].map((placeholder) => (
        <div
          key={placeholder}
          className='space-y-2 border-b px-3 py-2.5 last:border-b-0'
        >
          <div className='flex items-center justify-between'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-5 w-16 rounded-md' />
          </div>
          <div className='flex items-center justify-between gap-3'>
            <Skeleton className='h-7 w-44' />
            <Skeleton className='h-8 w-16' />
          </div>
          <Skeleton className='h-3 w-28' />
        </div>
      ))}
    </div>
  )
}

function ApiKeysMobileList({
  table,
  isLoading,
  activeId,
  onInspect,
  selectionMode,
}: {
  table: TanstackTable<ApiKey>
  isLoading: boolean
  activeId?: number
  onInspect: (id: number) => void
  selectionMode: boolean
}) {
  const { t } = useTranslation()
  const rows = table.getRowModel().rows

  if (isLoading) return <ApiKeysMobileSkeleton />

  if (!rows.length) {
    return (
      <div className='rounded-lg border p-8'>
        <Empty className='border-none p-0'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Database className='size-6' />
            </EmptyMedia>
            <EmptyTitle>{t('No API Keys Found')}</EmptyTitle>
            <EmptyDescription>
              {t(
                'No API keys available. Create your first API key to get started.'
              )}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className='pencil-key-grid'>
      {rows.map((row) => (
        <div key={row.id} data-slot='data-table-card'>
          <ApiKeyWorkspaceCard
            row={row}
            active={row.original.id === activeId}
            selected={row.getIsSelected()}
            selectionMode={selectionMode}
            onInspect={onInspect}
          />
        </div>
      ))}
    </div>
  )
}

export function ApiKeysTable() {
  const { t } = useTranslation()
  const isNarrowWorkspace = useMediaQuery('(max-width: 899px)')
  const [inspectedKeyId, setInspectedKeyId] = useState<number | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [viewMode, setViewMode] = useDataTableViewMode({
    storageKey: 'api-keys:pencil-view-mode',
    defaultMode: 'card',
  })
  const { refreshTrigger } = useApiKeys()
  const columns = useApiKeysColumns()

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: 20 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: '_tokenSearch', searchKey: 'token', type: 'string' },
    ],
  })

  const {
    value: tokenFilter,
    inputValue: tokenFilterInput,
    setInputValue: setTokenFilterInput,
  } = useDebouncedColumnFilter({
    columnFilters,
    columnId: '_tokenSearch',
    onColumnFiltersChange,
  })
  const shouldSearch = Boolean(globalFilter?.trim() || tokenFilter.trim())

  // Fetch data with React Query
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'keys',
      pagination.pageIndex + 1,
      pagination.pageSize,
      globalFilter,
      tokenFilter,
      refreshTrigger,
    ],
    queryFn: async () => {
      const result = shouldSearch
        ? await searchApiKeys({
            keyword: globalFilter,
            token: tokenFilter,
            p: pagination.pageIndex + 1,
            size: pagination.pageSize,
          })
        : await getApiKeys({
            p: pagination.pageIndex + 1,
            size: pagination.pageSize,
          })

      if (!result.success) {
        toast.error(
          result.message ||
            t(
              shouldSearch
                ? ERROR_MESSAGES.SEARCH_FAILED
                : ERROR_MESSAGES.LOAD_FAILED
            )
        )
        return { items: [], total: 0 }
      }

      return {
        items: result.data?.items || [],
        total: result.data?.total || 0,
      }
    },
    placeholderData: (previousData) => previousData,
  })

  const apiKeys = data?.items || []

  const { table } = useDataTable({
    data: apiKeys,
    columns,
    enableRowSelection: true,
    columnFilters,
    columnVisibilityStorageKey: API_KEYS_COLUMN_VISIBILITY_STORAGE_KEY,
    globalFilter,
    pagination,
    globalFilterFn: () => true,
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
    manualPagination: true,
    totalCount: data?.total || 0,
    ensurePageInRange,
  })

  const visibleRows = table.getRowModel().rows
  const inspectedRow =
    visibleRows.find((row) => row.original.id === inspectedKeyId) ??
    visibleRows[0]

  return (
    <div className='pencil-key-workspace'>
      <ApiKeyRecentPanel
        rows={visibleRows}
        activeId={inspectedRow?.original.id}
        onInspect={setInspectedKeyId}
      />
      <div className='pencil-key-rack'>
        <DataTablePage
          table={table}
          columns={columns}
          isLoading={isLoading}
          isFetching={isFetching}
          emptyTitle={t('No API Keys Found')}
          emptyDescription={t(
            'No API keys available. Create your first API key to get started.'
          )}
          skeletonKeyPrefix='api-keys-skeleton'
          className='pencil-key-table'
          fixedHeight={!isNarrowWorkspace}
          tableClassName='pencil-record-table'
          enableCardView
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          paginationInFooter={false}
          cardGridClassName='pencil-key-grid'
          renderCard={(row, helpers) => (
            <ApiKeyWorkspaceCard
              row={row}
              active={row.original.id === inspectedRow?.original.id}
              selected={helpers.isSelected}
              selectionMode={selectionMode}
              onInspect={setInspectedKeyId}
            />
          )}
          applyHeaderSize
          toolbar={
            <ApiKeysWorkspaceToolbar
              table={table}
              total={data?.total ?? 0}
              tokenFilterInput={tokenFilterInput}
              onTokenFilterInputChange={setTokenFilterInput}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              selectionMode={selectionMode}
              onSelectionModeChange={(enabled) => {
                setSelectionMode(enabled)
                if (!enabled) table.resetRowSelection()
              }}
            />
          }
          mobile={
            <ApiKeysMobileList
              table={table}
              isLoading={isLoading}
              activeId={inspectedRow?.original.id}
              onInspect={setInspectedKeyId}
              selectionMode={selectionMode}
            />
          }
          getRowClassName={(row) =>
            isDisabledApiKeyRow(row.original) ? DISABLED_ROW_DESKTOP : undefined
          }
          bulkActions={<DataTableBulkActions table={table} />}
        />
      </div>
      <ApiKeyInspector row={inspectedRow} />
    </div>
  )
}
