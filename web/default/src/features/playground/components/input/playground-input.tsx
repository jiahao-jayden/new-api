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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  PromptInput,
  PromptInputTextarea,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input'
import { GroupSelector, ModelSelector } from '@/components/model-group-selector'
import { ROLE } from '@/lib/roles'
import { useAuthStore } from '@/stores/auth-store'

import { getInputControlState, getSubmittableInputText } from '../../lib'
import type {
  ModelOption,
  GroupOption,
  PlaygroundConfig,
  ParameterEnabled,
} from '../../types'
import { PlaygroundInputControls } from './playground-input-controls'
import { PlaygroundInputTools } from './playground-input-tools'

interface PlaygroundInputProps {
  onSubmit: (text: string) => void
  onStop?: () => void
  disabled?: boolean
  isGenerating?: boolean
  models: ModelOption[]
  modelValue: string
  onModelChange: (value: string) => void
  isModelLoading?: boolean
  groups: GroupOption[]
  groupValue: string
  onGroupChange: (value: string) => void
  hasMessages?: boolean
  onClearMessages?: () => void
  config: PlaygroundConfig
  parameterEnabled: ParameterEnabled
}

export function PlaygroundInput({
  onSubmit,
  onStop,
  disabled,
  isGenerating,
  models,
  modelValue,
  onModelChange,
  isModelLoading = false,
  groups,
  groupValue,
  onGroupChange,
  hasMessages = false,
  onClearMessages,
  config,
  parameterEnabled,
}: PlaygroundInputProps) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const userRole = useAuthStore((state) => state.auth.user?.role ?? ROLE.GUEST)
  const { canSubmit, isSelectorDisabled, shouldShowStop } =
    getInputControlState({
      disabled,
      groups,
      hasStopHandler: Boolean(onStop),
      isGenerating,
      isModelLoading,
      models,
      text,
    })

  const handleSubmit = (message: PromptInputMessage) => {
    const submittableText = getSubmittableInputText(message, disabled)

    if (!submittableText) return
    onSubmit(submittableText)
    setText('')
  }

  return (
    <div className='pencil-playground-composer'>
      <PromptInput
        className='pencil-playground-form'
        groupClassName='pencil-playground-input-group'
        onSubmit={handleSubmit}
      >
        <div className='pencil-playground-model-slot'>
          <span className='console-hud-mark' aria-hidden='true' />
          <div className='pencil-playground-model-choice'>
            <span>{t('Current model')}</span>
            <ModelSelector
              selectedModel={modelValue}
              models={models}
              onModelChange={onModelChange}
              disabled={isSelectorDisabled}
              className='pencil-playground-model-trigger'
            />
          </div>
          {userRole >= ROLE.ADMIN && (
            <GroupSelector
              selectedGroup={groupValue}
              groups={groups}
              onGroupChange={onGroupChange}
              disabled={isSelectorDisabled}
              showGroupRatios={userRole >= ROLE.ADMIN}
              className='pencil-playground-group-trigger'
            />
          )}
        </div>
        <div className='pencil-playground-user-input'>
          <label htmlFor='playground-user-message'>USER</label>
          <PromptInputTextarea
            id='playground-user-message'
            autoComplete='off'
            autoCorrect='off'
            autoCapitalize='off'
            spellCheck={false}
            className='pencil-playground-textarea'
            disabled={disabled}
            onChange={(event) => setText(event.target.value)}
            placeholder={t('Ask anything')}
            value={text}
          />
        </div>
        <dl className='pencil-playground-parameters'>
          <div>
            <dt>{t('Temperature')}</dt>
            <dd>
              {parameterEnabled.temperature
                ? config.temperature.toFixed(2)
                : '—'}
            </dd>
          </div>
          <div>
            <dt>{t('Max Tokens')}</dt>
            <dd>{parameterEnabled.max_tokens ? config.max_tokens : '—'}</dd>
          </div>
          <div>
            <dt>Top P</dt>
            <dd>{parameterEnabled.top_p ? config.top_p.toFixed(2) : '—'}</dd>
          </div>
          <div>
            <dt>{t('Stream mode')}</dt>
            <dd>{config.stream ? t('On') : t('Off')}</dd>
          </div>
        </dl>
        <PlaygroundInputControls
          canSubmit={canSubmit}
          shouldShowStop={shouldShowStop}
          onStop={onStop}
          tools={
            <PlaygroundInputTools
              disabled={disabled}
              hasMessages={hasMessages}
              onClearMessages={onClearMessages}
            />
          }
        />
      </PromptInput>
    </div>
  )
}
