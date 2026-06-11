import type { NextConfig } from "next"
import { withSerwist } from "@serwist/turbopack"

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/serwist/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ]
  },
}

export default withSerwist(nextConfig)
