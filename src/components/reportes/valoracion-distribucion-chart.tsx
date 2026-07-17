import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type {
  ValoracionAgrupacion,
  ValoracionDistribucion,
} from "@/types/reporte"
import { formatCurrency } from "@/lib/utils"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  valorCosto: {
    label: "Valor a costo",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

interface ValoracionDistribucionChartProps {
  data?: ValoracionDistribucion
  isLoading: boolean
  agruparPor: ValoracionAgrupacion
  onAgruparPorChange: (value: ValoracionAgrupacion) => void
}

export function ValoracionDistribucionChart({
  data,
  isLoading,
  agruparPor,
  onAgruparPorChange,
}: ValoracionDistribucionChartProps) {
  const chartData = useMemo(
    () =>
      (data?.grupos ?? []).slice(0, 12).map((grupo) => ({
        nombre: grupo.nombre,
        valorCosto: grupo.valorCosto,
        porcentaje: grupo.porcentajeValor,
      })),
    [data]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de la valoración</CardTitle>
        <CardDescription>
          {data
            ? `${formatCurrency(data.totalValorCosto)} distribuidos por ${agruparPor}.`
            : "Valor a costo del stock disponible por grupo."}
        </CardDescription>
        <CardAction>
          <Select
            value={agruparPor}
            onValueChange={(value) =>
              onAgruparPorChange(value as ValoracionAgrupacion)
            }
          >
            <SelectTrigger className="w-40" aria-label="Agrupar valoración">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sucursal">Por sucursal</SelectItem>
              <SelectItem value="categoria">Por categoría</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[340px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Grafica no disponible
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[340px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ left: 12, right: 32 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: number) =>
                  Intl.NumberFormat("es-BO", { notation: "compact" }).format(value)
                }
              />
              <YAxis
                dataKey="nombre"
                type="category"
                width={120}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tickFormatter={(value: string) =>
                  value.length > 18 ? `${value.slice(0, 17)}…` : value
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
              />
              <Bar
                dataKey="valorCosto"
                fill="var(--color-valorCosto)"
                radius={[0, 5, 5, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
