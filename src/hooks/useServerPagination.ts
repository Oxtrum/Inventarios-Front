import { useCallback, useMemo, useState } from "react"

export function useServerPagination(pageSize = 10, resetKey = "") {
  const [state, setState] = useState({ resetKey, offset: 0 })
  const offset = state.resetKey === resetKey ? state.offset : 0

  const setOffset = useCallback(
    (nextOffset: number) => setState({ resetKey, offset: Math.max(0, nextOffset) }),
    [resetKey]
  )

  const params = useMemo(
    () => ({ limit: String(pageSize), offset: String(offset) }),
    [offset, pageSize]
  )

  const reset = useCallback(() => setState({ resetKey, offset: 0 }), [resetKey])

  return {
    params,
    offset,
    setOffset,
    reset,
  }
}
