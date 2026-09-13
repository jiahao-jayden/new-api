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
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import { runInNewContext } from 'node:vm'

const bridgeScript = readFileSync(
  new URL('../../../../public/dotapi-landing-bridge.js', import.meta.url),
  'utf8'
)

type ClickOptions = {
  href: string | null
  button?: number
  defaultPrevented?: boolean
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
}

function landingFrame(options = { framed: true, search: '?embedded=1' }) {
  const messages: { payload: unknown; targetOrigin: string }[] = []
  const listeners: ((event: object) => void)[] = []
  const parent = {
    postMessage(payload: unknown, targetOrigin: string) {
      messages.push({ payload: structuredClone(payload), targetOrigin })
    },
  }
  const browserWindow: {
    parent: unknown
    location: { search: string }
  } = {
    parent,
    location: { search: options.search },
  }
  if (!options.framed) browserWindow.parent = browserWindow

  runInNewContext(bridgeScript, {
    URLSearchParams,
    window: browserWindow,
    document: {
      addEventListener(type: string, listener: (event: object) => void) {
        if (type === 'click') listeners.push(listener)
      },
    },
  })

  return {
    messages,
    click(options: ClickOptions) {
      let preventCalls = 0
      const event = {
        button: 0,
        defaultPrevented: false,
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        ...options,
        target: {
          // The click may originate from any descendant of the CTA anchor.
          closest(selector: string) {
            return selector === `a[href="${options.href}"]` && options.href
              ? { href: options.href }
              : null
          },
        },
        preventDefault() {
          event.defaultPrevented = true
          preventCalls += 1
        },
      }
      for (const listener of listeners) listener(event)
      return { defaultPrevented: event.defaultPrevented, preventCalls }
    },
  }
}

describe('embedded landing API-key navigation', () => {
  test('routes the normal embedded CTA through the parent without native navigation', () => {
    const frame = landingFrame()

    assert.deepEqual(frame.click({ href: '/keys' }), {
      defaultPrevented: true,
      preventCalls: 1,
    })
    assert.deepEqual(frame.messages, [
      { payload: { type: 'dotapi:open-keys' }, targetOrigin: '*' },
    ])
  })

  test('keeps native CTA navigation outside the explicitly embedded console', () => {
    for (const options of [
      { framed: false, search: '?embedded=1' },
      { framed: false, search: '' },
      { framed: true, search: '' },
      { framed: true, search: '?embedded=0' },
    ]) {
      const frame = landingFrame(options)

      assert.deepEqual(frame.click({ href: '/keys' }), {
        defaultPrevented: false,
        preventCalls: 0,
      })
      assert.deepEqual(frame.messages, [])
    }
  })

  test('does not intercept other anchors, modified clicks, or canceled events', () => {
    const cases: ClickOptions[] = [
      { href: '#how' },
      { href: '/wallet' },
      { href: 'https://example.com/keys' },
      { href: null },
      { href: '/keys', metaKey: true },
      { href: '/keys', ctrlKey: true },
      { href: '/keys', shiftKey: true },
      { href: '/keys', altKey: true },
      { href: '/keys', button: 1 },
      { href: '/keys', defaultPrevented: true },
    ]

    for (const entry of cases) {
      const frame = landingFrame()

      assert.deepEqual(frame.click(entry), {
        defaultPrevented: entry.defaultPrevented ?? false,
        preventCalls: 0,
      })
      assert.deepEqual(frame.messages, [])
    }
  })
})
