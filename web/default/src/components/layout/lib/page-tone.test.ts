import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { resolvePageTone } from './page-tone'

describe('resolvePageTone', () => {
  test('maps primary workspaces to their sidebar tone', () => {
    assert.equal(resolvePageTone('/home'), 'home')
    assert.equal(resolvePageTone('/pricing'), 'platform')
    assert.equal(resolvePageTone('/rankings'), 'rankings')
    assert.equal(resolvePageTone('/docs'), 'docs')
    assert.equal(resolvePageTone('/about'), 'about')
    assert.equal(resolvePageTone('/playground'), 'chat')
    assert.equal(resolvePageTone('/dashboard/models'), 'general')
    assert.equal(resolvePageTone('/keys'), 'keys')
    assert.equal(resolvePageTone('/usage-logs/common'), 'usage-common')
    assert.equal(resolvePageTone('/usage-logs/task'), 'usage-task')
    assert.equal(resolvePageTone('/wallet'), 'personal')
    assert.equal(resolvePageTone('/profile'), 'profile')
    assert.equal(resolvePageTone('/channels'), 'admin')
    assert.equal(
      resolvePageTone('/system-settings/site/system-info'),
      'system-administration'
    )
  })

  test('does not match unrelated path prefixes', () => {
    assert.equal(resolvePageTone('/wallets'), 'platform')
    assert.equal(resolvePageTone('/channels-preview'), 'platform')
    assert.equal(resolvePageTone('/usage-logs-preview'), 'platform')
  })
})
