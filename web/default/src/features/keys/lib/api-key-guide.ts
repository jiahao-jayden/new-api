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

export type ApiKeyGuideModelFamily = 'openai' | 'anthropic'
export type ApiKeyGuideUseCase = 'third-party' | 'vibe-coding'

export type ApiKeyCreateGuideSelection = {
  modelFamily: ApiKeyGuideModelFamily
  useCase: ApiKeyGuideUseCase
}

export function getGuideName(selection: ApiKeyCreateGuideSelection): string {
  const family = selection.modelFamily === 'openai' ? 'OpenAI' : 'Claude'
  const purpose =
    selection.useCase === 'vibe-coding' ? 'Vibe Coding' : 'Third-party App'
  return `${family} ${purpose}`
}

export function getGuideModelLimits(
  selection: ApiKeyCreateGuideSelection | null | undefined,
  models: string[]
): string[] {
  if (!selection) return []

  if (selection.modelFamily === 'anthropic') {
    return models.filter((model) => model.toLowerCase().includes('claude'))
  }

  return models.filter((model) => {
    const normalized = model.toLowerCase()
    return (
      normalized.includes('gpt') ||
      normalized.startsWith('o1') ||
      normalized.startsWith('o3') ||
      normalized.startsWith('o4')
    )
  })
}
