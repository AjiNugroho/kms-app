"use client"

import { useState } from "react"
import { Controller,useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"

const loginSchema = z.object({
  identifier: z.string().min(1, "Email atau username wajib diisi"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const form = useForm < z.infer < typeof loginSchema >> ({
        resolver: zodResolver(loginSchema),
        defaultValues:{
            identifier: '',
            password: ''
        }
    })

  async function onSubmit(values: LoginValues) {
    setIsPending(true)
    try {
      const isEmail = values.identifier.includes("@")

      if (isEmail) {
        const { error } = await authClient.signIn.email({
          email: values.identifier,
          password: values.password,
        })
        console.log("disnini")
        console.log(values)
        if (error) throw new Error(error.message ?? "Gagal masuk")
      } else {
        const { error } = await authClient.signIn.username({
          username: values.identifier,
          password: values.password,
        })
        if (error) throw new Error(error.message ?? "Gagal masuk")
      }

      toast.success("Login telah berhasil")
      router.push("/")
      router.refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal masuk, silakan coba lagi"
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldSet>
        <FieldGroup>
                    <Controller
                    name="identifier"
                    control={form.control}
                    render={({field,fieldState})=>(
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>
                                Email
                            </FieldLabel>

                            <Input
                                {...field}
                                id={field.name}
                                aria-invalid={fieldState.invalid}
                                placeholder="email or username"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}

                        </Field>
                    )}
                    />
                    <Controller
                    name="password"
                    control={form.control}
                    render={({field,fieldState})=>(
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>
                                Password
                            </FieldLabel>

                            <PasswordInput
                                {...field}
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}

                        </Field>
                    )}
                    />
        </FieldGroup>

        <FieldGroup>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Masuk
          </Button>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}
