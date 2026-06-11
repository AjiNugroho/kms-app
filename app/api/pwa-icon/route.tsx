import { createIconResponse } from "@/lib/pwa-icon"
import { type NextRequest } from "next/server"

export function GET(request: NextRequest) {
  const sizeParam = request.nextUrl.searchParams.get("size")
  const size = sizeParam === "512" ? 512 : 192
  return createIconResponse(size)
}
