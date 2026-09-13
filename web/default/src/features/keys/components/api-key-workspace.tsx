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
import type { Row } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { GameIcon } from '@/components/game-ui/game-icon'
import { StatusBadge } from '@/components/status-badge'
import { Checkbox } from '@/components/ui/checkbox'
import { formatQuota, formatTimestampToDate } from '@/lib/format'
import { ROLE } from '@/lib/roles'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

import { API_KEY_STATUSES, API_KEY_STATUS, DEFAULT_GROUP } from '../constants'
import type { ApiKey } from '../types'
import { ApiKeyCell } from './api-keys-cells'
import { DataTableRowActions } from './data-table-row-actions'

function KeyQuotaMeter(props: { apiKey: ApiKey; compact?: boolean }) {
  const { t } = useTranslation()
  const total = props.apiKey.used_quota + props.apiKey.remain_quota

  return (
    <div className='pencil-key-meter' data-compact={props.compact}>
      <div className='flex items-center justify-between gap-3'>
        <span>{t('Used quota')}</span>
        <span className='font-mono tabular-nums'>
          {formatQuota(props.apiKey.used_quota)}
        </span>
      </div>
      {!props.apiKey.unlimited_quota && (
        <progress
          aria-label={t('Quota')}
          max={Math.max(total, 1)}
          value={Math.min(
            Math.max(props.apiKey.used_quota, 0),
            Math.max(total, 1)
          )}
        />
      )}
    </div>
  )
}

export function ApiKeyWorkspaceCard(props: {
  row: Row<ApiKey>
  active: boolean
  selected: boolean
  selectionMode?: boolean
  onInspect: (id: number) => void
}) {
  const { t } = useTranslation()
  const apiKey = props.row.original
  const status = API_KEY_STATUSES[apiKey.status]

  return (
    <article
      className={cn(
        'pencil-key-card game-surface',
        props.active ? 'game-surface-list-selected' : 'game-surface-panel'
      )}
      data-active={props.active}
      data-key-status={apiKey.status}
    >
      <button
        type='button'
        className='pencil-key-card-open'
        onClick={() => props.onInspect(apiKey.id)}
        aria-pressed={props.active}
        aria-label={`${t('API Key')} ${apiKey.name}`}
      >
        <div className='game-key-art'>
          <GameIcon
            name={
              apiKey.status === API_KEY_STATUS.ENABLED
                ? 'key-gold'
                : 'key-silver'
            }
            family='items'
            size={32}
            className='game-key-artwork'
            aria-hidden='true'
          />
          <h3 className='min-w-0 break-words'>{apiKey.name}</h3>
        </div>
        <div className='game-key-nameplate'>
          <div className='game-key-credentials'>
            <span className='pencil-key-prefix'>sk-{apiKey.key}</span>
            <span className='game-key-state'>
              <span
                className='pencil-key-status-dot'
                data-enabled={apiKey.status === API_KEY_STATUS.ENABLED}
                data-status={apiKey.status}
                aria-hidden='true'
              />
              <span>{status ? t(status.label) : String(apiKey.status)}</span>
            </span>
          </div>
          <KeyQuotaMeter apiKey={apiKey} compact />
        </div>
      </button>
      {props.selectionMode && (
        <div className='game-key-card-selection'>
          <Checkbox
            checked={props.selected}
            onCheckedChange={(value) => props.row.toggleSelected(!!value)}
            aria-label={`${t('Select row')} ${apiKey.name}`}
          />
        </div>
      )}
      <div className='pencil-key-card-actions'>
        <DataTableRowActions row={props.row} variant='menu' />
      </div>
    </article>
  )
}

export function ApiKeyRecentPanel(props: {
  rows: Row<ApiKey>[]
  activeId?: number
  onInspect: (id: number) => void
}) {
  const { t } = useTranslation()
  const recent = [...props.rows]
    .filter((row) => row.original.accessed_time > 0)
    .sort((a, b) => b.original.accessed_time - a.original.accessed_time)
    .slice(0, 3)

  return (
    <aside
      className='pencil-key-recent game-surface game-surface-panel-muted'
      aria-label={t('In use')}
    >
      <h2>
        <GameIcon name='key-gold' family='items' className='size-6' />
        {t('In use')}
      </h2>
      {recent.length ? (
        recent.map((row, index) => (
          <button
            type='button'
            className={cn(
              'pencil-key-recent-item game-surface',
              row.original.id === props.activeId
                ? 'game-surface-list-selected'
                : 'game-surface-list'
            )}
            data-active={row.original.id === props.activeId}
            data-key-status={row.original.status}
            key={row.id}
            onClick={() => props.onInspect(row.original.id)}
            aria-pressed={row.original.id === props.activeId}
          >
            <div className='pencil-key-recent-top'>
              <span className='pencil-key-index'>
                {String(index + 1).padStart(2, '0')}
              </span>
              <strong>{row.original.name}</strong>
              <span
                className='pencil-key-status-dot'
                data-enabled={row.original.status === API_KEY_STATUS.ENABLED}
                data-status={row.original.status}
              />
            </div>
            <span className='pencil-key-prefix'>sk-{row.original.key}</span>
            <time>{formatTimestampToDate(row.original.accessed_time)}</time>
            <KeyQuotaMeter apiKey={row.original} />
          </button>
        ))
      ) : (
        <div className='pencil-key-recent-empty'>
          <GameIcon name='key-1' className='size-8' />
          <span>{t('Never')}</span>
        </div>
      )}
    </aside>
  )
}

export function ApiKeyInspector(props: { row?: Row<ApiKey> }) {
  const { t } = useTranslation()
  const userRole = useAuthStore((state) => state.auth.user?.role ?? ROLE.GUEST)
  if (!props.row) return null

  const apiKey = props.row.original
  const status = API_KEY_STATUSES[apiKey.status]
  const totalQuota = Math.max(apiKey.used_quota + apiKey.remain_quota, 1)
  const usedQuota = Math.max(0, Math.min(apiKey.used_quota, totalQuota))
  const usedPercent = Math.round((usedQuota / totalQuota) * 100)
  const metadata = [
    [t('Created'), formatTimestampToDate(apiKey.created_time)],
    [
      t('Last activity'),
      apiKey.accessed_time > 0
        ? formatTimestampToDate(apiKey.accessed_time)
        : t('Never'),
    ],
    ...(userRole >= ROLE.ADMIN
      ? [[t('Group'), apiKey.group || DEFAULT_GROUP]]
      : []),
    [
      t('Models'),
      apiKey.model_limits_enabled && apiKey.model_limits
        ? apiKey.model_limits.split(',').join('\n')
        : t('Unrestricted'),
    ],
    [t('IP allowlist'), apiKey.allow_ips?.trim() || t('Unrestricted')],
    [
      t('Expiration Time'),
      apiKey.expired_time === -1
        ? t('No expiry')
        : formatTimestampToDate(apiKey.expired_time),
    ],
    [
      t('Quota limit'),
      apiKey.unlimited_quota
        ? t('Unlimited')
        : formatQuota(apiKey.used_quota + apiKey.remain_quota),
    ],
    [t('Used quota'), formatQuota(apiKey.used_quota)],
  ]

  return (
    <aside
      className='pencil-key-inspector game-surface game-surface-panel'
      data-key-status={apiKey.status}
      aria-label={t('Key details')}
    >
      <h2>
        <GameIcon name='key-gold' family='items' className='size-6' />
        {t('Key details')}
      </h2>
      <h3>{apiKey.name}</h3>
      <div className='pencil-key-inspector-token'>
        <ApiKeyCell apiKey={apiKey} />
      </div>
      <div className='pencil-key-inspector-status'>
        {status && (
          <StatusBadge
            label={
              apiKey.status === API_KEY_STATUS.ENABLED
                ? t('Key enabled')
                : t(status.label)
            }
            variant={status.variant}
            copyable={false}
            type='text'
            showDot
          />
        )}
      </div>
      <dl className='pencil-key-metadata'>
        {metadata.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd
              className={cn(
                label === t('Models') && 'font-mono',
                (label === t('Used quota') || label === t('Quota limit')) &&
                  'game-key-quota-value'
              )}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <div className='pencil-key-quota-summary'>
        <div>
          <span>{t('Quota')}</span>
          <span>
            {apiKey.unlimited_quota ? t('Unlimited') : `${usedPercent}%`}
          </span>
        </div>
        {!apiKey.unlimited_quota && (
          <progress
            aria-label={t('Quota')}
            max={totalQuota}
            value={usedQuota}
          />
        )}
      </div>
      <div className='pencil-key-inspector-actions'>
        <DataTableRowActions row={props.row} variant='inspector' />
      </div>
    </aside>
  )
}
