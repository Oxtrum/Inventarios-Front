import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { MovimientosResumen } from "@/types/reporte"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

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

interface MovimientosResumenChartProps {
  data?: MovimientosResumen
  isLoading: boolean
}

function formatPeriod(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("es-BO", { day: "2-digit", month: "short" })
}

export function MovimientosResumenChart({ data, isLoading }: MovimientosResumenChartProps) {
  const series = Array.isArray(data?.series) ? data.series : []
  const chartData = series.map((item) => ({
    periodo: item.periodo,
    entradas: item.entradasCantidad,
    salidas: item.salidasCantidad,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia de movimientos</CardTitle>
        <CardDescription>Entradas y salidas consolidadas para el alcance elegido.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Grafica no disponible
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart data={chartData} margin={{ left: 8, right: 8 }}>
              <defs>
                <linearGradient id="executiveEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-entradas)" stopOpacity={0.75} />
                  <stop offset="95%" stopColor="var(--color-entradas)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="executiveSalidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-salidas)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--color-salidas)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="periodo"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={28}
                tickFormatter={formatPeriod}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent labelFormatter={(value) => formatPeriod(String(value))} indicator="dot" />}
              />
              <Area
                dataKey="entradas"
                type="monotone"
                fill="url(#executiveEntradas)"
                stroke="var(--color-entradas)"
              />
              <Area
                dataKey="salidas"
                type="monotone"
                fill="url(#executiveSalidas)"
                stroke="var(--color-salidas)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
