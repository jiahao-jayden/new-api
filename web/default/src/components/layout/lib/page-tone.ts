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

export type PageTone =
  | 'platform'
  | 'chat'
  | 'general'
  | 'personal'
  | 'admin'
  | 'system-administration'

const PAGE_TONE_ROUTES: ReadonlyArray<{
  pattern: RegExp
  tone: PageTone
}> = [
  {
    pattern: /^\/system-settings(?:\/|$)/,
    tone: 'system-administration',
  },
  {
    pattern:
      /^\/(?:channels|models|users|redemption-codes|subscriptions|system-info)(?:\/|$)/,
    tone: 'admin',
  },
  { pattern: /^\/(?:wallet|profile)(?:\/|$)/, tone: 'personal' },
  {
    pattern: /^\/(?:dashboard|keys|usage-logs)(?:\/|$)/,
    tone: 'general',
  },
  { pattern: /^\/(?:playground|chat|chat2link)(?:\/|$)/, tone: 'chat' },
]

export function resolvePageTone(pathname: string): PageTone {
  return (
    PAGE_TONE_ROUTES.find(({ pattern }) => pattern.test(pathname))?.tone ??
    'platform'
  )
}
