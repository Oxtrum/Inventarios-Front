function localDay(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return undefined

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }
  return date
}

export function startOfLocalDayISO(value: string): string | undefined {
  return localDay(value)?.toISOString()
}

export function startOfNextLocalDayISO(value: string): string | undefined {
  const date = localDay(value)
  if (!date) return undefined
  date.setDate(date.getDate() + 1)
  return date.toISOString()
}

export function endOfLocalDayISO(value: string): string | undefined {
  const date = localDay(value)
  if (!date) return undefined
  date.setDate(date.getDate() + 1)
  date.setSeconds(date.getSeconds() - 1)
  return `${date.toISOString().slice(0, 19)}.999999Z`
}
