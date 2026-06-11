"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardPlus,
  Users,
  TriangleAlert,
  UserCircle,
  HouseHeart,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Beranda",   href: "/",                icon: LayoutDashboard, exact: true },
  { label: "KMS Input", href: "/kms-input",        icon: ClipboardPlus,   exact: false },
  { label: "Kunjungan", href: "/children-visit",    icon: HouseHeart,   exact: false },
  { label: "Profil",    href: "/profile",           icon: UserCircle,      exact: false },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-100 flex h-16 items-stretch border-t bg-background md:hidden">
      {navItems.map(({ label, href, icon: Icon, exact }) => {
        const active = isActive(href, exact)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
