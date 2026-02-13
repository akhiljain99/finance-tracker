"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from 'next/link'
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
 
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email."),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  })
})

type SignInFormValues = z.infer<typeof signInSchema>

export default function SignIn(){
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const form = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema), 
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onChange",
    })

    async function onSubmit(data: SignInFormValues){
        setLoading(true)
        const result = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
            callbackUrl: "/dashboard",
        })
        setLoading(false)

        if (result?.error) {
            toast.error("Invalid email or password.")
            return
        }

        router.push(result?.url ?? "/dashboard")
        toast.success("Signed in successfully.")
    }

    const handleGoogle = async () => {
        setLoading(true)
        await signIn("google", { callbackUrl: "/dashboard" })
      }

    return (
        <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(16,163,127,0.18),transparent_36%),radial-gradient(circle_at_86%_12%,rgba(68,125,255,0.16),transparent_34%)]" />
            <div className="mx-auto flex min-h-[82vh] w-full max-w-6xl animate-in fade-in-0 items-center justify-center px-4 py-10 duration-500 md:px-8">
                <Card className="w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-3 border-border/80 bg-card/90 shadow-lg shadow-black/5 duration-500 [animation-fill-mode:both] backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-2xl tracking-tight">Welcome Back</CardTitle>
                        <CardDescription>
                            Sign in to your finance control room.
                        </CardDescription>
                        <CardAction>
                            <Link href="/sign-up">
                                <Button variant="ghost" className="h-9 text-sm font-medium">
                                    Sign up
                                </Button>
                            </Link>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                <CardFooter className="px-0 pb-0">
                                    <Button type="submit" name="login" className="w-full" disabled={loading}>
                                        Login
                                    </Button>
                                </CardFooter>
                            </form>
                            <Separator orientation="horizontal" className="my-4"/>
                            <CardFooter className="px-0 pb-0">
                                <Button onClick={handleGoogle} variant="outline" className="w-full" disabled={loading}>
                                    Continue with Google
                                </Button>
                            </CardFooter>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
