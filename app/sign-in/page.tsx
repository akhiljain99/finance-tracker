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
        <div className="relative mx-auto flex min-h-[80vh] w-full max-w-6xl items-center justify-center px-4 py-10 md:px-8">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.16),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(16,185,129,0.16),transparent_30%)]" />
            <Card className="w-full max-w-md border-border/70 bg-card/90 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                    <CardDescription>
                        Simple Finance • Make finance simple
                    </CardDescription>
                    <CardAction>
                        <Link href="/sign-up">
                            <Button 
                                variant="ghost" 
                                className="text-sm font-medium h-10 hover:bg-accent hover:text-accent-foreground cursor-pointer">
                                    Sign Up
                            </Button>
                        </Link>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="mail@mail.com" {...field} />
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
                                        <Input
                                            placeholder="test123"
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <CardFooter className="flex-col gap-2">
                                <Button type="submit" name="login" className="w-full" disabled={loading}>
                                        Login
                                </Button>
                            </CardFooter>
                            
                            
                        </form>
                        <Separator orientation="horizontal" className="my-2"/>
                        <CardFooter className="flex-col gap-2">
                            <Button onClick={handleGoogle} variant="outline" className="w-full" disabled={loading}>
                                    Login with Google
                            </Button>
                        </CardFooter>
                        
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
