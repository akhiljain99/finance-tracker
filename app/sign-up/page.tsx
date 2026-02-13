"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from 'next/navigation'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const registrationSchema = z.object({
    username: z
      .string()
      .min(2, {
        message: "Name must be at least 2 characters.",
      })
      .max(30, {
        message: "Name must not be longer than 30 characters.",
      }),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .max(32, 'Password cannot exceed 32 characters'),
    confirmPassword: z
        .string()
        .min(8, 'Confirm password must be at least 8 characters long')
        .max(32, 'Confirm password cannot exceed 32 characters'),
    }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match!',
    path: ['confirmPassword'],
    })

type RegistrationFormValues = z.infer<typeof registrationSchema>

export default function SignUp(){
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const form = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        },
        mode: "onChange",
    })

   async function onSubmit(data: RegistrationFormValues){
        setLoading(true)
        try {
            const name = data.username
            const email = data.email
            const password = data.password
            const response = await fetch('/api/signUp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password}), 
            })

            if (response.ok) {
                router.push("/sign-in")
                toast.success('Account created successfully!')
            } else {
                const payload = await response.json().catch(() => null)
                toast.error(payload?.error ?? "Something went wrong. Please try again.")
            }
        } catch (error) {
            console.error('Error submitting form:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_18%,rgba(16,163,127,0.16),transparent_32%),radial-gradient(circle_at_82%_8%,rgba(68,125,255,0.14),transparent_34%)]" />
            <div className="mx-auto flex min-h-[82vh] w-full max-w-6xl animate-in fade-in-0 items-center justify-center px-4 py-10 duration-500 md:px-8">
                <Card className="w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-3 border-border/80 bg-card/90 shadow-lg shadow-black/5 duration-500 [animation-fill-mode:both] backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl tracking-tight">Create your account</CardTitle>
                        <CardDescription>
                            Start with a clean finance workspace in under a minute.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input placeholder="johndoe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="you@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input placeholder="********" type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input placeholder="********" type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                               <Button type="submit" className="w-full" disabled={loading}>
                                    Create account
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
