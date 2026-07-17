import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

import type { ConteoItem } from "@/types/conteo"
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

const chartConfig = {
  diferencia: {
    label: "Diferencia",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

interface DiferenciasConteoChartProps {
  items: ConteoItem[]
  productoNombrePorId: Map<string, string>
}

export function DiferenciasConteoChart({
  items,
  productoNombrePorId,
}: DiferenciasConteoChartProps) {
  const safeItems = useMemo(
    () => (Array.isArray(items) ? items : []),
    [items]
  )

  const chartData = useMemo(() => {
    const nombres = safeItems.map(
      (item) => productoNombrePorId.get(item.productoId) ?? "Producto"
    )
    const repeticiones = new Map<string, number>()
    const totalPorNombre = nombres.reduce((map, nombre) => {
      map.set(nombre, (map.get(nombre) ?? 0) + 1)
      return map
    }, new Map<string, number>())

    return safeItems
      .map((item, index) => {
        const nombre = nombres[index]
        const repeticion = (repeticiones.get(nombre) ?? 0) + 1
        repeticiones.set(nombre, repeticion)

        return {
          label:
            (totalPorNombre.get(nombre) ?? 0) > 1
              ? `${nombre} · V${repeticion}`
              : nombre,
          diferencia: item.diferencia ?? 0,
        }
      })
      .filter((item) => item.diferencia !== 0)
      .sort((a, b) => Math.abs(b.diferencia) - Math.abs(a.diferencia))
      .slice(0, 10)
  }, [safeItems, productoNombrePorId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diferencias detectadas</CardTitle>
        <CardDescription>
          Los valores negativos son faltantes y los positivos son sobrantes. Se
          muestran las 10 diferencias más significativas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
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
                width={120}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tickFormatter={(value: string) =>
                  value.length > 18 ? `${value.slice(0, 17)}…` : value
                }
              />
              <ReferenceLine x={0} stroke="var(--border)" />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="diferencia" radius={4}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`${entry.label}-${index}`}
                    fill={
                      entry.diferencia < 0
                        ? "var(--highlight)"
                        : "var(--color-diferencia)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
