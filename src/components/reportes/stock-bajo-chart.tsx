import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import type { StockBajoItem } from "@/types/reporte"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  deficit: {
    label: "Déficit",
    color: "var(--highlight)",
  },
} satisfies ChartConfig

interface StockBajoChartProps {
  items: StockBajoItem[]
  isLoading: boolean
}

export function StockBajoChart({ items, isLoading }: StockBajoChartProps) {
  const chartData = useMemo(
    () =>
      (Array.isArray(items) ? items : [])
        .map((item) => ({
          label: item.codigo?.trim() || item.nombre,
          deficit: Math.max(item.stockMinimo - item.stockDisponible, 0),
          disponible: item.stockDisponible,
          minimo: item.stockMinimo,
        }))
        .sort((a, b) => b.deficit - a.deficit)
        .slice(0, 10),
    [items]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos con mayor déficit</CardTitle>
        <CardDescription>
          Diferencia entre el stock mínimo y el disponible. Se muestran los 10
          casos más críticos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-36 items-center justify-center text-sm text-muted-foreground">
            Grafica no disponible
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="h-[300px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ left: 8, right: 20 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} />
              <YAxis
                dataKey="label"
                type="category"
                width={110}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tickFormatter={(value: string) =>
                  value.length > 16 ? `${value.slice(0, 15)}…` : value
                }
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="deficit"
                fill="var(--color-deficit)"
                radius={[0, 5, 5, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
