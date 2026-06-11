import { ImageResponse } from "next/og"

// Baby icon paths from lucide-react v1.16.0
const BABY_PATHS = [
  "M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5",
  "M15 12h.01",
  "M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1",
  "M9 12h.01",
]

export function createIconResponse(size: number) {
  const padding = Math.round(size * 0.2)
  const iconSize = size - padding * 2
  const strokeWidth = Math.max(1.5, size / 16)
  const radius = Math.round(size * 0.22)

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#16a34a",
          borderRadius: radius,
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {BABY_PATHS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </svg>
      </div>
    ),
    { width: size, height: size }
  )
}
