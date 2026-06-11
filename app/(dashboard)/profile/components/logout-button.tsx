"use client"

import { useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await authClient.signOut()
    toast.success("Berhasil keluar")
    router.push("/login")
    router.refresh()
  }

  return (
    <Button
      variant="destructive"
      className="w-full gap-2"
      onClick={handleLogout}
    >
      <LogOutIcon className="size-4" />
      Keluar dari Akun
    </Button>
  )
}
