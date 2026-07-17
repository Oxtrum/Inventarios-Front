import { useMemo } from "react"
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts"

import type { KardexItem } from "@/types/reporte"
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
  efecto: {
    label: "Movimiento",
    color: "var(--chart-2)",
  },
  saldo: {
    label: "Saldo",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

interface KardexChartProps {
  items: KardexItem[]
  isLoading: boolean
}

export function KardexChart({ items, isLoading }: KardexChartProps) {
  const chartData = useMemo(
    () =>
      (Array.isArray(items) ? items : []).map((item) => ({
        date: item.fechaCreacion,
        efecto: item.efecto,
        saldo: item.saldo,
      })),
    [items]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución del saldo</CardTitle>
        <CardDescription>
          Cada barra representa el efecto de un movimiento y la línea muestra el
          saldo resultante.
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
            <ComposedChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 4, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                minTickGap={28}
                tickFormatter={(value: string) =>
                  new Date(value).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                  })
                }
              />
              <YAxis axisLine={false} tickLine={false} width={42} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const date = payload?.[0]?.payload?.date
                      return date
                        ? new Date(date).toLocaleString("es-ES")
                        : "Movimiento"
                    }}
                    indicator="dot"
                  />
                }
              />
              <Bar dataKey="efecto" radius={3}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`${entry.date}-${index}`}
                    fill={
                      entry.efecto < 0
                        ? "var(--highlight)"
                        : "var(--color-efecto)"
                    }
                  />
                ))}
              </Bar>
              <Line
                dataKey="saldo"
                type="stepAfter"
                stroke="var(--color-saldo)"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
