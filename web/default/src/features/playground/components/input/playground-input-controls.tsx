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
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { PromptInputButton } from '@/components/ai-elements/prompt-input'
import { PlayIcon, SquareIcon } from '@/components/game-ui/icons'

type PlaygroundInputControlsProps = {
  canSubmit: boolean
  shouldShowStop: boolean
  onStop?: () => void
  tools: ReactNode
}

export function PlaygroundInputControls({
  canSubmit,
  shouldShowStop,
  onStop,
  tools,
}: PlaygroundInputControlsProps) {
  const { t } = useTranslation()
  return (
    <div className='pencil-playground-submit-controls'>
      {shouldShowStop ? (
        <PromptInputButton
          className='pencil-playground-send bg-destructive text-white'
          onClick={onStop}
          variant='secondary'
        >
          <SquareIcon className='fill-current' size={16} />
          <span>{t('Stop')}</span>
        </PromptInputButton>
      ) : (
        <PromptInputButton
          className='pencil-playground-send bg-primary text-primary-foreground hover:bg-primary/90'
          disabled={!canSubmit}
          type='submit'
          variant='default'
        >
          <PlayIcon size={13} />
          <span>{t('Send request')}</span>
        </PromptInputButton>
      )}
      {tools}
    </div>
  )
}
