import { useCallback, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"

import { useAuth } from "@/context/auth-provider"
import { useSucursal } from "@/context/sucursal-provider"
import type { QueryParams } from "@/lib/api"
import { startOfLocalDayISO, startOfNextLocalDayISO } from "@/lib/date-range"

export type ReportGranularity = "dia" | "semana" | "mes"

interface UseReportFiltersOptions {
  includePeriod?: boolean
  includeGranularity?: boolean
  defaultDays?: number
}

function dateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function defaultPeriod(days: number) {
  const hasta = new Date()
  const desde = new Date(hasta)
  desde.setDate(desde.getDate() - Math.max(days - 1, 0))
  return { desde: dateInputValue(desde), hasta: dateInputValue(hasta) }
}

export function useReportFilters(options: UseReportFiltersOptions = {}) {
  const {
    includePeriod = false,
    includeGranularity = false,
    defaultDays = 30,
  } = options
  const [searchParams, setSearchParams] = useSearchParams()
  const { alcanceDatos } = useAuth()
  const { sucursales, sucursalActiva } = useSucursal()
  const defaults = useMemo(() => defaultPeriod(defaultDays), [defaultDays])
  const allowedIds = useMemo(() => new Set(sucursales.map((item) => item.id)), [sucursales])

  const rawIds = useMemo(() => searchParams.getAll("sucursalId"), [searchParams])
  const explicitIds = useMemo(
    () => [...new Set(rawIds.filter((id) => allowedIds.has(id)))],
    [allowedIds, rawIds]
  )
  const hasExplicitScope = searchParams.has("alcance") || rawIds.length > 0
  const sucursalIds = useMemo(
    () => hasExplicitScope
      ? explicitIds
      : (sucursalActiva && allowedIds.has(sucursalActiva.id) ? [sucursalActiva.id] : []),
    [allowedIds, explicitIds, hasExplicitScope, sucursalActiva]
  )

  const fechaDesde = searchParams.get("fechaDesde") || defaults.desde
  const fechaHasta = searchParams.get("fechaHasta") || defaults.hasta
  const rawGranularity = searchParams.get("granularidad")
  const granularidad: ReportGranularity = rawGranularity === "semana" || rawGranularity === "mes"
    ? rawGranularity
    : "dia"

  const updateParams = useCallback((update: (params: URLSearchParams) => void) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      update(next)
      return next
    }, { replace: true })
  }, [setSearchParams])

  const setSucursalIds = useCallback((ids: string[]) => {
    const normalized = [...new Set(ids.filter((id) => allowedIds.has(id)))]
    updateParams((params) => {
      params.delete("sucursalId")
      normalized.forEach((id) => params.append("sucursalId", id))
      params.set("alcance", normalized.length === 0 ? "todas" : "seleccion")
    })
  }, [allowedIds, updateParams])

  const setFechaDesde = useCallback((value: string) => {
    updateParams((params) => params.set("fechaDesde", value))
  }, [updateParams])

  const setFechaHasta = useCallback((value: string) => {
    updateParams((params) => params.set("fechaHasta", value))
  }, [updateParams])

  const setGranularidad = useCallback((value: ReportGranularity) => {
    updateParams((params) => params.set("granularidad", value))
  }, [updateParams])

  useEffect(() => {
    if (
      hasExplicitScope
      && (!includePeriod || (searchParams.has("fechaDesde") && searchParams.has("fechaHasta")))
      && (!includeGranularity || searchParams.has("granularidad"))
    ) {
      return
    }
    updateParams((params) => {
      if (!hasExplicitScope) {
        params.delete("sucursalId")
        sucursalIds.forEach((id) => params.append("sucursalId", id))
        params.set("alcance", sucursalIds.length === 0 ? "todas" : "seleccion")
      }
      if (includePeriod) {
        if (!params.has("fechaDesde")) params.set("fechaDesde", fechaDesde)
        if (!params.has("fechaHasta")) params.set("fechaHasta", fechaHasta)
      }
      if (includeGranularity && !params.has("granularidad")) {
        params.set("granularidad", granularidad)
      }
    })
  }, [
    fechaDesde,
    fechaHasta,
    granularidad,
    hasExplicitScope,
    includeGranularity,
    includePeriod,
    searchParams,
    sucursalIds,
    updateParams,
  ])

  const scopeLabel = sucursalIds.length === 0
    ? (alcanceDatos === "sucursales" ? "Todas mis sucursales" : "Toda la organización")
    : sucursalIds.length === 1
      ? (sucursales.find((item) => item.id === sucursalIds[0])?.nombre ?? "1 sucursal")
      : `${sucursalIds.length} sucursales`

  const apiParams = useMemo<QueryParams>(() => ({
    ...(sucursalIds.length > 0 ? { sucursalId: sucursalIds } : {}),
    ...(includePeriod ? {
      fechaDesde: startOfLocalDayISO(fechaDesde),
      fechaHasta: startOfNextLocalDayISO(fechaHasta),
    } : {}),
    ...(includeGranularity ? { granularidad } : {}),
  }), [fechaDesde, fechaHasta, granularidad, includeGranularity, includePeriod, sucursalIds])

  return {
    sucursales,
    sucursalIds,
    setSucursalIds,
    scopeLabel,
    allScopeLabel: alcanceDatos === "sucursales" ? "Todas mis sucursales" : "Toda la organización",
    fechaDesde,
    fechaHasta,
    setFechaDesde,
    setFechaHasta,
    granularidad,
    setGranularidad,
    apiParams,
    queryString: searchParams.toString(),
  }
}

export type ReportFiltersState = ReturnType<typeof useReportFilters>
