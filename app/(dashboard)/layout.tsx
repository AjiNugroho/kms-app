import { headers } from "next/headers"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { HeaderUser } from "@/components/header-user"
import { auth } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user ?? null

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Mobile top app bar */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
            <span className="flex-1 text-base font-semibold">KMS Digital</span>
            <ThemeToggle />
          </header>

          {/* Desktop top header bar */}
          <header className="hidden h-12 shrink-0 items-center gap-2 border-b px-4 md:flex">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Sistem Pemantauan Tumbuh Kembang Anak
            </span>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              {user && <HeaderUser user={user} />}
            </div>
          </header>

          {/* Page content — extra bottom padding on mobile for the bottom nav */}
          <div className="flex flex-1 flex-col gap-6 p-6 pb-24 md:pb-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>

      {/* Rendered outside SidebarProvider so position:fixed is always viewport-relative */}
      <MobileBottomNav />
    </TooltipProvider>
  )
}
