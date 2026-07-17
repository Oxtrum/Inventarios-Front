import { useMemo } from "react"
import { Cell, Pie, PieChart } from "recharts"

import type {
  ReservaEstado,
  ReservasResumen,
} from "@/types/reporte"
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

const estadoConfig: Record<
  ReservaEstado,
  { label: string; color: string }
> = {
  activa: { label: "Activas", color: "var(--chart-1)" },
  confirmada: { label: "Confirmadas", color: "var(--chart-2)" },
  liberada: { label: "Liberadas", color: "var(--chart-3)" },
  expirada: { label: "Expiradas", color: "var(--chart-4)" },
}

const chartConfig = {
  totalReservas: {
    label: "Reservas",
  },
} satisfies ChartConfig

interface ReservasResumenChartProps {
  data?: ReservasResumen
  isLoading: boolean
}

export function ReservasResumenChart({
  data,
  isLoading,
}: ReservasResumenChartProps) {
  const chartData = useMemo(
    () =>
      (data?.porEstado ?? []).map((item) => ({
        ...item,
        label: estadoConfig[item.estado]?.label ?? item.estado,
        fill: estadoConfig[item.estado]?.color ?? "var(--muted-foreground)",
      })),
    [data]
  )
  const totalReservas = chartData.reduce(
    (total, item) => total + item.totalReservas,
    0
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de reservas</CardTitle>
        <CardDescription>
          Distribución por estado durante los últimos 30 días y situación actual.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(280px,1fr)]">
            {totalReservas === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                Grafica no disponible
              </div>
            ) : (
              <div>
                <ChartContainer config={chartConfig} className="mx-auto h-[240px] w-full">
                  <PieChart accessibilityLayer>
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          hideLabel
                          nameKey="label"
                          formatter={(value) => `${value} reservas`}
                        />
                      }
                    />
                    <Pie
                      data={chartData}
                      dataKey="totalReservas"
                      nameKey="label"
                      innerRadius={58}
                      outerRadius={92}
                      strokeWidth={3}
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.estado} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  {chartData.map((item) => (
                    <div key={item.estado} className="flex items-center gap-1.5">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      {item.label}: {item.totalReservas}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid content-center gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <SnapshotItem
                label="Activas ahora"
                value={data?.snapshot.activasAhora ?? 0}
              />
              <SnapshotItem
                label="Unidades reservadas"
                value={data?.snapshot.unidadesReservadasAhora ?? 0}
              />
              <SnapshotItem
                label="Expiran en 30 minutos"
                value={data?.snapshot.expiranProximos30Minutos ?? 0}
                alert={(data?.snapshot.expiranProximos30Minutos ?? 0) > 0}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SnapshotItem({
  label,
  value,
  alert = false,
}: {
  label: string
  value: number
  alert?: boolean
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold tabular-nums ${
          alert ? "text-destructive" : ""
        }`}
      >
        {value}
      </p>
    </div>
  )
}
