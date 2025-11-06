"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from 'next/navigation';
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
    email: z
      .string()
      .email("Invalid email address"),
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
    path: ['confirmPassword'], // This specifies where the error message will be displayed
    })

  type RegistrationFormValues = z.infer<typeof registrationSchema>

export default function SignIn(){
    const router = useRouter()
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
            });
            if (response.ok) {
                router.push("/sign-in")
                toast.success('Account created successfully!')
            } else {
                toast.error("Something went wrong. Please try again.")
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    }
    return (
        <div className="flex flex-row justify-center items center mt-20">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle >Create your account</CardTitle>
                    <CardDescription>
                        Access all that <u>Simple Finance</u> has to offer with just one account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
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
                           <Button type="submit" className="w-full">
                                Sign Up
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            
        </div>
    )
}