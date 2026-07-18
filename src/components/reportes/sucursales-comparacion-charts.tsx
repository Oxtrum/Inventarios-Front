import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { SucursalComparacionItem } from "@/types/reporte"
import { formatCurrency } from "@/lib/utils"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const valorConfig = {
  valorInventario: {
    label: "Valor inventario",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const actividadConfig = {
  entradasCantidad: {
    label: "Entradas",
    color: "var(--chart-1)",
  },
  salidasCantidad: {
    label: "Salidas",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

interface ComparisonChartProps {
  data?: SucursalComparacionItem[]
  isLoading: boolean
}

function ChartFallback() {
  return (
    <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
      Grafica no disponible
    </div>
  )
}

export function SucursalesValorChart({ data, isLoading }: ComparisonChartProps) {
  const chartData = (Array.isArray(data) ? [...data] : [])
    .sort((a, b) => b.valorInventario - a.valorInventario)
    .slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valor de inventario por sucursal</CardTitle>
        <CardDescription>Comparación del valor disponible a costo.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : chartData.length === 0 ? (
          <ChartFallback />
        ) : (
          <ChartContainer config={valorConfig} className="h-[300px] w-full">
            <BarChart data={chartData} layout="vertical" margin={{ left: 12, right: 12 }}>
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(Number(value))}
              />
              <YAxis
                dataKey="sucursalNombre"
                type="category"
                tickLine={false}
                axisLine={false}
                width={110}
                tickFormatter={(value) => String(value).slice(0, 18)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />}
              />
              <Bar dataKey="valorInventario" fill="var(--color-valorInventario)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function SucursalesActividadChart({ data, isLoading }: ComparisonChartProps) {
  const chartData = (Array.isArray(data) ? [...data] : [])
    .sort((a, b) => b.movimientos - a.movimientos)
    .slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad por sucursal</CardTitle>
        <CardDescription>Unidades de entrada y salida en el período.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : chartData.length === 0 ? (
          <ChartFallback />
        ) : (
          <ChartContainer config={actividadConfig} className="h-[300px] w-full">
            <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="sucursalNombre"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => String(value).slice(0, 12)}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="entradasCantidad" fill="var(--color-entradasCantidad)" radius={4} />
              <Bar dataKey="salidasCantidad" fill="var(--color-salidasCantidad)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
