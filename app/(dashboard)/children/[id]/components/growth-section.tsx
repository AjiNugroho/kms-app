'use client'

import { useRef, useMemo, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts"
import { DownloadIcon, UploadIcon, ZoomOutIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useChildGrowth, useUploadGrowth } from "../datahooks/useChildDetail"
import { useChildById } from "../datahooks/useChildDetail"
import { getWhoData, type WhoGender } from "../datahooks/who-standards"

type ZoomState = {
  refAreaLeft: number | null
  refAreaRight: number | null
  isSelecting: boolean
  domain: [number, number] | null
}

const defaultZoom: ZoomState = {
  refAreaLeft: null,
  refAreaRight: null,
  isSelecting: false,
  domain: null,
}

type ChartPoint = {
  month: number
  value: number | null
  sd3neg: number
  sd2neg: number
  sd0: number
  sd2: number
  sd3: number
}

type TabKey = 'weight' | 'height' | 'head'

const TAB_CONFIG: Record<TabKey, { label: string; unit: string; childKey: 'weight' | 'length' | 'headCircumference' }> = {
  weight: { label: "Berat Badan", unit: "kg", childKey: "weight" },
  height: { label: "Tinggi Badan", unit: "cm", childKey: "length" },
  head:   { label: "Lingkar Kepala", unit: "cm", childKey: "headCircumference" },
}

type Props = { childId: string }

export function GrowthSection({ childId }: Props) {
  const { data: child } = useChildById(childId)
  const { data: rawData, isLoading, isError } = useChildGrowth(childId)
  const uploadGrowth = useUploadGrowth(childId)
  const fileRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<TabKey>('weight')
  const [zoom, setZoom] = useState<ZoomState>(defaultZoom)

  const gender: WhoGender = child?.gender === 'perempuan' ? 'perempuan' : 'laki-laki'

  const sortedData = useMemo(
    () =>
      (rawData ?? [])
        .slice()
        .sort((a, b) => a.month - b.month)
        .map((r) => ({
          month: r.month,
          weight: r.weight != null ? parseFloat(r.weight) : null,
          length: r.length != null ? parseFloat(r.length) : null,
          headCircumference: r.headCircumference != null ? parseFloat(r.headCircumference) : null,
        })),
    [rawData]
  )

  function buildChartData(metric: TabKey): ChartPoint[] {
    const whoRows = getWhoData(
      metric === 'height' ? 'height' : metric === 'head' ? 'head' : 'weight',
      gender
    )
    const childKey = TAB_CONFIG[metric].childKey
    const childMap = new Map(sortedData.map((r) => [r.month, r[childKey]]))
    const maxChildMonth = sortedData.length > 0 ? sortedData[sortedData.length - 1].month : 0
    const maxMonth = Math.max(maxChildMonth, 0)

    return whoRows
      .filter((row) => row[0] <= Math.max(maxMonth, 12))
      .map((row) => ({
        month: row[0],
        value: childMap.get(row[0]) ?? null,
        sd3neg: row[1],
        sd2neg: row[2],
        sd0:    row[3],
        sd2:    row[4],
        sd3:    row[5],
      }))
  }

  const chartDataMap = useMemo(
    () => ({
      weight: buildChartData('weight'),
      height: buildChartData('height'),
      head:   buildChartData('head'),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortedData, gender]
  )

  const displayData = useMemo(() => {
    const all = chartDataMap[activeTab]
    if (!zoom.domain) return all
    const [l, r] = zoom.domain
    return all.filter((d) => d.month >= l && d.month <= r)
  }, [chartDataMap, activeTab, zoom.domain])

  function parseLabel(label: string | number | undefined): number | null {
    if (label == null) return null
    const n = typeof label === "number" ? label : parseInt(String(label), 10)
    return isNaN(n) ? null : n
  }

  function handleMouseDown(e: { activeLabel?: string | number } | null) {
    const val = parseLabel(e?.activeLabel)
    if (val != null) setZoom((z) => ({ ...z, refAreaLeft: val, isSelecting: true }))
  }

  function handleMouseMove(e: { activeLabel?: string | number } | null) {
    if (!zoom.isSelecting) return
    const val = parseLabel(e?.activeLabel)
    if (val != null) setZoom((z) => ({ ...z, refAreaRight: val }))
  }

  function handleMouseUp() {
    const { refAreaLeft, refAreaRight } = zoom
    if (refAreaLeft != null && refAreaRight != null && refAreaLeft !== refAreaRight) {
      const [l, r] = [refAreaLeft, refAreaRight].sort((a, b) => a - b) as [number, number]
      setZoom({ refAreaLeft: null, refAreaRight: null, isSelecting: false, domain: [l, r] })
    } else {
      setZoom((z) => ({ ...z, refAreaLeft: null, refAreaRight: null, isSelecting: false }))
    }
  }

  function resetZoom() {
    setZoom(defaultZoom)
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab as TabKey)
    resetZoom()
  }

  function handleDownload() {
    window.open(`/api/children/${childId}/growth/download`, "_blank")
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await uploadGrowth.mutateAsync(file)
      toast.success(`${result.upserted} data perkembangan berhasil diimpor`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal mengimpor data")
    } finally {
      e.target.value = ""
    }
  }

  const hasData = sortedData.length > 0

  function renderChart(metric: TabKey) {
    const { unit } = TAB_CONFIG[metric]
    const data = metric === activeTab ? displayData : chartDataMap[metric]
    const hasChildPoints = data.some((d) => d.value != null)

    if (!hasChildPoints && !isLoading && !isError) {
      return (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          Belum ada data. Unggah file Excel untuk menambahkan data.
        </div>
      )
    }

    return (
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ userSelect: "none" }}
            margin={{ top: 5, right: 16, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              label={{ value: "Bulan ke-", position: "insideBottomRight", offset: -5, fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} width={40} />
            <Tooltip
              formatter={(value, name) => {
                const labelMap: Record<string, string> = {
                  value: `Nilai Anak (${unit})`,
                  sd3neg: "-3SD",
                  sd2neg: "-2SD",
                  sd0: "Median",
                  sd2: "+2SD",
                  sd3: "+3SD",
                }
                const key = String(name)
                const label = labelMap[key] ?? key
                if (value == null) return ["-", label] as [string, string]
                return [`${value} ${unit}`, label] as [string, string]
              }}
            />
            <Legend
              formatter={(value: string) => {
                const labelMap: Record<string, string> = {
                  value: `Nilai Anak`,
                  sd3neg: "WHO -3SD",
                  sd2neg: "WHO -2SD",
                  sd0: "WHO Median",
                  sd2: "WHO +2SD",
                  sd3: "WHO +3SD",
                }
                return labelMap[value] ?? value
              }}
            />

            {/* WHO reference lines */}
            <Line type="monotone" dataKey="sd3neg" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" dot={false} />
            <Line type="monotone" dataKey="sd2neg" stroke="#f97316" strokeWidth={1} strokeDasharray="4 3" dot={false} />
            <Line type="monotone" dataKey="sd0"    stroke="#22c55e" strokeWidth={1} strokeDasharray="5 3" dot={false} />
            <Line type="monotone" dataKey="sd2"    stroke="#f97316" strokeWidth={1} strokeDasharray="4 3" dot={false} />
            <Line type="monotone" dataKey="sd3"    stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" dot={false} />

            {/* Child data */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#3b82f6" }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />

            {zoom.refAreaLeft != null && zoom.refAreaRight != null && (
              <ReferenceArea
                x1={zoom.refAreaLeft}
                x2={zoom.refAreaRight}
                strokeOpacity={0.3}
                fill="#6366f1"
                fillOpacity={0.15}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>Perkembangan Fisik</CardTitle>
          <div className="flex items-center gap-2">
            {zoom.domain && (
              <Button size="sm" variant="outline" onClick={resetZoom}>
                <ZoomOutIcon />
                Reset Zoom
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <DownloadIcon />
              Unduh Data
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={uploadGrowth.isPending}
            >
              <UploadIcon />
              {uploadGrowth.isPending ? "Mengimpor..." : "Unggah Data"}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleUpload}
            />
          </div>
        </div>
        {hasData && !zoom.domain && (
          <p className="text-xs text-muted-foreground">
            Klik dan seret pada grafik untuk zoom ke rentang tertentu.
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-80 w-full" />}
        {isError && (
          <p className="text-sm text-destructive">Gagal memuat data perkembangan.</p>
        )}
        {!isLoading && !isError && (
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="weight">Berat Badan</TabsTrigger>
              <TabsTrigger value="height">Tinggi Badan</TabsTrigger>
              <TabsTrigger value="head">Lingkar Kepala</TabsTrigger>
            </TabsList>
            <TabsContent value="weight">{renderChart('weight')}</TabsContent>
            <TabsContent value="height">{renderChart('height')}</TabsContent>
            <TabsContent value="head">{renderChart('head')}</TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
