"use client"

import * as React from "react"
import Link from "next/link"
import {
  Baby,
  ChartArea,
  LayoutDashboard,
  Shield,
  Users,
} from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { NavMain, type NavItem } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const navItems: NavItem[] = [
  {
    title: "Beranda",
    url: "/",
    icon: <LayoutDashboard />,
    exact: true,
  },
  {
    title: "Data Statistik",
    url: "/analytics",
    icon: <ChartArea />,
  },
  {
    title: "Data Anak",
    url: "/children",
    icon: <Users />,
  },
  {
    title: "Admin",
    url: "/admin",
    icon: <Shield />,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession()
  const user = session?.user ?? null

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* ── Brand header ── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <Baby className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">KMS Digital</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    Tumbuh Kembang Anak
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ── Navigation ── */}
      <SidebarContent>
        <NavMain label="Menu Utama" items={navItems} />
      </SidebarContent>

      {/* ── User footer ── */}
      <SidebarSeparator />
      <SidebarFooter>
        {user ? (
          <NavUser user={user} />
        ) : (
          <div className="px-2 py-1.5 text-xs text-sidebar-foreground/50">
            Tidak ada sesi aktif
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
