import assert from "node:assert/strict"
import { test } from "node:test"

import {
  endOfLocalDayISO,
  startOfLocalDayISO,
  startOfNextLocalDayISO,
} from "../src/lib/date-range.ts"

test("los limites cubren el dia local completo", () => {
  const previous = process.env.TZ
  try {
    process.env.TZ = "America/La_Paz"
    assert.equal(startOfLocalDayISO("2026-10-15"), "2026-10-15T04:00:00.000Z")
    assert.equal(startOfNextLocalDayISO("2026-10-15"), "2026-10-16T04:00:00.000Z")
    assert.equal(endOfLocalDayISO("2026-10-15"), "2026-10-16T03:59:59.999999Z")

    process.env.TZ = "America/New_York"
    assert.equal(startOfLocalDayISO("2026-03-08"), "2026-03-08T05:00:00.000Z")
    assert.equal(startOfNextLocalDayISO("2026-03-08"), "2026-03-09T04:00:00.000Z")
    assert.equal(endOfLocalDayISO("2026-03-08"), "2026-03-09T03:59:59.999999Z")

    assert.equal(startOfLocalDayISO("2026-02-30"), undefined)
  } finally {
    if (previous === undefined) delete process.env.TZ
    else process.env.TZ = previous
  }
})
