import { ImageResponse } from "next/og"

export function createIconResponse(size: number) {
  const radius = Math.round(size * 0.22)
  const fontSize = Math.round(size * 0.38)

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
        <span
          style={{
            color: "white",
            fontSize,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          SK
        </span>
      </div>
    ),
    { width: size, height: size }
  )
}
