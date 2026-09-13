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
import { describe, test } from 'node:test'

import {
  aggregateObservation,
  observationQueryRanges,
} from './usage-observation'

describe('usage observation', () => {
  test('separates calendar-month costs from rolling-week calls and local hourly usage', () => {
    const now = new Date(2026, 8, 2, 12, 30)
    const result = aggregateObservation(
      [
        {
          created_at: new Date(2026, 7, 27, 8).getTime() / 1000,
          count: 2,
          quota: 100,
          model_name: 'A',
        },
        {
          created_at: new Date(2026, 7, 31, 23).getTime() / 1000,
          count: 3,
          quota: 200,
          model_name: 'A',
        },
        {
          created_at: new Date(2026, 8, 1, 23).getTime() / 1000,
          count: 5,
          quota: 300,
          model_name: 'B',
        },
        {
          created_at: new Date(2026, 8, 2, 0).getTime() / 1000,
          count: 7,
          quota: 400,
          model_name: 'A',
        },
        {
          created_at: new Date(2026, 8, 2, 12).getTime() / 1000,
          count: 11,
          quota: 500,
          model_name: 'B',
        },
        {
          created_at: new Date(2026, 8, 2, 13).getTime() / 1000,
          count: 99,
          quota: 9900,
          model_name: 'B',
        },
      ],
      now
    )
    assert.equal(result.todayCalls, 18)
    assert.equal(result.yesterdayCalls, 5)
    assert.equal(result.todayQuota, 900)
    assert.equal(result.monthQuota, 1200)
    assert.equal(result.weekCalls, 28)
    assert.deepEqual(result.models, [
      { name: 'B', count: 16 },
      { name: 'A', count: 12 },
    ])
    assert.deepEqual(
      result.days.map((day) => day.count),
      [2, 0, 0, 0, 3, 5, 18]
    )
    assert.equal(result.hours[0].count, 7)
    assert.equal(result.hours[12].count, 11)
    assert.equal(result.hours[13].count, 0)
  })

  test('fetches the previous month when the visible seven days cross a month boundary', () => {
    const now = new Date(2026, 8, 2, 12)
    const ranges = observationQueryRanges(now)
    assert.equal(
      ranges[0].start_timestamp,
      new Date(2026, 7, 27).getTime() / 1000
    )
    assert.equal(ranges.at(-1)?.end_timestamp, now.getTime() / 1000)
  })

  test('covers a 31-day month without violating the self endpoint limit or double-counting boundaries', () => {
    const now = new Date(2026, 7, 31, 23, 59, 59)
    const ranges = observationQueryRanges(now)
    assert.equal(ranges.length, 2)
    assert.equal(
      ranges[0].start_timestamp,
      new Date(2026, 7, 1).getTime() / 1000
    )
    assert.equal(ranges[1].start_timestamp, ranges[0].end_timestamp + 1)
    assert.equal(ranges[1].end_timestamp, now.getTime() / 1000)
    assert.ok(
      ranges.every(
        (range) => range.end_timestamp - range.start_timestamp <= 2_592_000
      )
    )
  })

  test('renders real zero usage without manufacturing chart values', () => {
    const result = aggregateObservation([], new Date(2026, 8, 2, 12))
    assert.equal(result.weekCalls, 0)
    assert.equal(result.todayQuota, 0)
    assert.equal(result.monthQuota, 0)
    assert.deepEqual(result.models, [])
    assert.ok(result.hours.every((hour) => hour.count === 0))
    assert.ok(result.days.every((day) => day.count === 0))
  })

  test('rolls today and month totals forward without counting the prior month as the new month', () => {
    const rows = [
      {
        created_at: new Date(2026, 7, 31, 23).getTime() / 1000,
        count: 12,
        quota: 500,
        model_name: 'A',
      },
    ]
    const beforeMidnight = new Date(2026, 7, 31, 23, 59, 59)
    const afterMidnight = new Date(2026, 8, 1, 0, 0, 1)
    const before = aggregateObservation(rows, beforeMidnight)
    const after = aggregateObservation(rows, afterMidnight)
    assert.equal(before.todayCalls, 12)
    assert.equal(before.monthQuota, 500)
    assert.equal(after.todayCalls, 0)
    assert.equal(after.todayQuota, 0)
    assert.equal(after.yesterdayCalls, 12)
    assert.equal(after.monthQuota, 0)
    assert.equal(after.weekCalls, 12)
    assert.equal(after.days.at(-1)?.label, '01')
    assert.equal(
      observationQueryRanges(afterMidnight)[0].start_timestamp,
      new Date(2026, 7, 26).getTime() / 1000
    )
    assert.equal(
      observationQueryRanges(beforeMidnight)[0].start_timestamp,
      new Date(2026, 7, 1).getTime() / 1000
    )
  })
})
