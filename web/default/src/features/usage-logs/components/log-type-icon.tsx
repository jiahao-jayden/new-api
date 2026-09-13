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
import { GameIcon } from '@/components/game-ui/game-icon'

const logTypeIcons: Record<string, string> = {
  '0': 'menu-2',
  '1': 'coin-2',
  '2': 'energy',
  '3': 'setting-1',
  '4': 'monitor',
  '5': 'symbol-warning',
  '6': 'refresh',
  '7': 'user-1',
}

export function LogTypeIcon(props: { value: string | number }) {
  return (
    <GameIcon
      name={logTypeIcons[String(props.value)] ?? 'menu-2'}
      className='game-log-type-icon'
      data-log-type={props.value}
      size={24}
    />
  )
}
