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
import type { Ref } from 'react'
import { useTranslation } from 'react-i18next'

import { GlassInspectorFrame } from '@/components/ui/glass-inspector-frame'

import {
  ModelDetailsContent,
  type ModelDetailsContentProps,
} from './model-details'

export function ModelSelectionPanel(
  props: ModelDetailsContentProps & { panelRef?: Ref<HTMLElement> }
) {
  const { t } = useTranslation()

  return (
    <aside
      ref={props.panelRef}
      id='pricing-model-inspector'
      className='pencil-model-inspector pencil-model-inspector-full game-surface game-surface-panel'
      data-model-product={props.model.vendor_name}
      aria-label={t('Model details')}
      tabIndex={-1}
    >
      <GlassInspectorFrame className='model-inspector-frame' />
      <div className='model-inspector-content'>
        <ModelDetailsContent {...props} inspector />
      </div>
    </aside>
  )
}
