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
import { create } from 'zustand'

import { useAuthStore } from './auth-store'

export type PreferredCurrency = 'CNY' | 'USD'

type CurrencyPreferences = Record<string, PreferredCurrency>

const STORAGE_KEY = 'currency-preferences:v1'

interface CurrencyPreferenceState {
  preferences: CurrencyPreferences
  setPreference: (userId: number, currency: PreferredCurrency) => void
}

/** Preferences are local to this browser and isolated by signed-in account. */
export const useCurrencyPreferenceStore = create<CurrencyPreferenceState>()((
  set
) => {
  let preferences: CurrencyPreferences = {}
  try {
    if (typeof window !== 'undefined') {
      const saved: unknown = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) || '{}'
      )
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        preferences = Object.fromEntries(
          Object.entries(saved).filter(
            ([id, currency]) =>
              /^[1-9]\d*$/.test(id) &&
              (currency === 'CNY' || currency === 'USD')
          )
        )
      }
    }
  } catch {
    // A blocked or damaged browser store must not prevent account access.
  }

  return {
    preferences,
    setPreference: (userId, currency) => {
      if (!Number.isSafeInteger(userId) || userId <= 0) return
      if (currency !== 'CNY' && currency !== 'USD') return
      set((state) => {
        const next = { ...state.preferences, [userId]: currency }
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
          }
        } catch {
          // The preference still works for this session when storage is blocked.
        }
        return { preferences: next }
      })
    },
  }
})

export function getPreferredCurrency(): PreferredCurrency {
  const userId = useAuthStore.getState().auth.user?.id
  if (!userId) return 'CNY'
  return useCurrencyPreferenceStore.getState().preferences[userId] ?? 'CNY'
}

export function useCurrencyPreference(): PreferredCurrency {
  const userId = useAuthStore((state) => state.auth.user?.id)
  return useCurrencyPreferenceStore((state) =>
    userId ? (state.preferences[userId] ?? 'CNY') : 'CNY'
  )
}
