'use client'

import { useRef, useMemo, useState, useEffect } from "react"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

// Chart layout constants — must match the LineChart margin + YAxis width props below
const Y_AXIS_WIDTH = 40
const CHART_MARGIN_RIGHT = 16

type Props = { childId: string }

export function GrowthSection({ childId }: Props) {
  const { data: child } = useChildById(childId)
  const { data: rawData, isLoading, isError } = useChildGrowth(childId)
  const uploadGrowth = useUploadGrowth(childId)
  const fileRef = useRef<HTMLInputElement>(null)
  const chartWrapperRef = useRef<HTMLDivElement>(null)

  const [activeTab, setActiveTab] = useState<TabKey>('weight')
  const [zoom, setZoom] = useState<ZoomState>(defaultZoom)
  const [isMobile, setIsMobile] = useState(false)
  const isSelectingRef = useRef(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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

  // Map a clientX pixel coordinate to the nearest month value in the current dataset
  function pointerXToMonth(clientX: number): number | null {
    const wrapper = chartWrapperRef.current
    if (!wrapper) return null
    const rect = wrapper.getBoundingClientRect()
    const relX = clientX - rect.left
    const plotLeft = Y_AXIS_WIDTH
    const plotRight = rect.width - CHART_MARGIN_RIGHT
    const plotWidth = plotRight - plotLeft
    if (plotWidth <= 0) return null
    const fraction = Math.max(0, Math.min(1, (relX - plotLeft) / plotWidth))
    const data = chartDataMap[activeTab]
    if (data.length === 0) return null
    const minMonth = data[0].month
    const maxMonth = data[data.length - 1].month
    return Math.round(minMonth + fraction * (maxMonth - minMonth))
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Only primary button (left-click / first touch)
    if (e.button !== 0 && e.pointerType === 'mouse') return
    const month = pointerXToMonth(e.clientX)
    if (month == null) return
    isSelectingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    setZoom((z) => ({ ...z, refAreaLeft: month, refAreaRight: null, isSelecting: true }))
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isSelectingRef.current) return
    const month = pointerXToMonth(e.clientX)
    if (month == null) return
    setZoom((z) => ({ ...z, refAreaRight: month }))
  }

  function handlePointerUp() {
    if (!isSelectingRef.current) return
    isSelectingRef.current = false
    setZoom((z) => {
      const { refAreaLeft, refAreaRight } = z
      if (refAreaLeft != null && refAreaRight != null && refAreaLeft !== refAreaRight) {
        const [l, r] = [refAreaLeft, refAreaRight].sort((a, b) => a - b) as [number, number]
        return { refAreaLeft: null, refAreaRight: null, isSelecting: false, domain: [l, r] }
      }
      return { ...z, refAreaLeft: null, refAreaRight: null, isSelecting: false }
    })
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
      <div className="h-120 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            style={{ userSelect: "none" }}
            margin={{ top: 5, right: CHART_MARGIN_RIGHT, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              label={{ value: "Bulan ke-", position: "insideBottomRight", offset: -5, fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} width={Y_AXIS_WIDTH} />
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
            {!isMobile && (
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
            )}

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
            {/* Desktop */}
            <TabsList className="mb-4 hidden sm:flex">
              <TabsTrigger value="weight">Berat Badan</TabsTrigger>
              <TabsTrigger value="height">Tinggi Badan</TabsTrigger>
              <TabsTrigger value="head">Lingkar Kepala</TabsTrigger>
            </TabsList>
            {/* Mobile */}
            <div className="mb-4 sm:hidden">
              <Select value={activeTab} onValueChange={handleTabChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">Berat Badan</SelectItem>
                  <SelectItem value="height">Tinggi Badan</SelectItem>
                  <SelectItem value="head">Lingkar Kepala</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Chart wrapper handles pointer events for cross-platform zoom */}
            <div
              ref={chartWrapperRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              style={{
                touchAction: zoom.isSelecting ? 'none' : 'pan-y',
                cursor: 'crosshair',
              }}
            >
              {renderChart(activeTab)}
            </div>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
