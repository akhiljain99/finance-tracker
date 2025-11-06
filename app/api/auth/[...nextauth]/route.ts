import {NextAuthOptions} from 'next-auth';
import GoogleProvider from 'next-auth/providers/google'
import { PrismaClient } from '@prisma/client';
import NextAuth from 'next-auth/next';

const prisma = new PrismaClient()

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
    }, 
    providers: [
        GoogleProvider({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET
        })
    ],
    callbacks: {
        async signIn({account, profile}){
            if(!profile?.email){
                throw new Error("No profile")
            }

            await prisma?.user.upsert({
                where: {
                    email: profile.email,
                }, 
                create: {
                    email: profile.email, 
                    name: profile.name,
                },
                update: {
                    name: profile.name
                }
            })

            return true
        }
    }
}

const handler = NextAuth(authOptions)
export {handler as GET, handler as POST}