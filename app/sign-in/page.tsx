"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
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
 
const signInSchema = z.object({
  email: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "password must be at least 2 characters"
  })
})

type SignInFormValues = z.infer<typeof signInSchema>

export default function SignIn(){
    const form = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema), 
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onChange",
    })

    function onSubmit(){

    }
    return (
        <div className="flex flex-row justify-center items center mt-20">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
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
                            <Button type="submit" name="login" className="w-full">
                                Login
                            </Button>
                            <Button type="submit" name="google" variant="outline" className="w-full">
                                Login with Google
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}