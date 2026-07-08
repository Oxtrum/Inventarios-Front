"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useMovimientos } from "@/hooks/useInventario"
import { useIsMobile } from "@/hooks/use-mobile"
import { toLocalDateInput } from "@/lib/utils"
import type { MovementType } from "@/types/common"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"

export const description = "Movimientos de inventario: entradas vs salidas"

const movementDirection: Record<MovementType, "entradas" | "salidas"> = {
  STOCK_INICIAL: "entradas",
  COMPRA: "entradas",
  AJUSTE_ENTRADA: "entradas",
  TRANSFERENCIA_ENTRA: "entradas",
  DEVOLUCION_ENTRA: "entradas",
  VENTA: "salidas",
  AJUSTE_SALIDA: "salidas",
  TRANSFERENCIA_SALE: "salidas",
  DEVOLUCION_SALE: "salidas",
  PERDIDA: "salidas",
}

const chartConfig = {
  entradas: {
    label: "Entradas",
    color: "var(--chart-1)",
  },
  salidas: {
    label: "Salidas",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function daysForRange(timeRange: string): number {
  if (timeRange === "30d") return 30
  if (timeRange === "7d") return 7
  return 90
}

function isoDateDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return toLocalDateInput(date)
}

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState(() => isMobile ? "7d" : "90d")

  const fechaDesde = isoDateDaysAgo(daysForRange(timeRange))
  const { data: movimientos, isLoading } = useMovimientos({ fechaDesde })

  const chartData = React.useMemo(() => {
    const byDate = new Map<string, { entradas: number; salidas: number }>()

    for (const movimiento of movimientos ?? []) {
      const date = movimiento.fechaCreacion.slice(0, 10)
      const direction = movementDirection[movimiento.tipo]
      const entry = byDate.get(date) ?? { entradas: 0, salidas: 0 }
      entry[direction] += movimiento.cantidad
      byDate.set(date, entry)
    }

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, totals]) => ({ date, ...totals }))
  }, [movimientos])

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Movimientos de Inventario</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Entradas y salidas en el período seleccionado
          </span>
          <span className="@[540px]/card:hidden">Entradas y salidas</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">Últimos 30 días</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 días</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Seleccionar período"
            >
               <SelectValue placeholder="Últimos 3 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Últimos 30 días
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 días
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="aspect-auto h-[250px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-[250px] w-full items-center justify-center text-sm text-muted-foreground">
            Sin movimientos en este período
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-entradas)"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-entradas)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillSalidas" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-salidas)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-salidas)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("es-ES", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("es-ES", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="salidas"
                type="natural"
                fill="url(#fillSalidas)"
                stroke="var(--color-salidas)"
                stackId="a"
              />
              <Area
                dataKey="entradas"
                type="natural"
                fill="url(#fillEntradas)"
                stroke="var(--color-entradas)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
