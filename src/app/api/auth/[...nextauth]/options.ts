import { NextAuthOptions } from "next-auth";
import  CredentialsProvider  from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/user";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [{email: credentials.identifier.email}, {password: credentials.identifier.password}]
                    })
                    if(!user){
                        throw new Error("User not found with this email ");
                    }
                    if(!user.isVerified){
                        throw new Error("Please verify your account before login");
                    }
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    
                    if(isPasswordValid){
                        return user;
                    }
                    else{
                        throw new Error("Invalid password");
                    }
                    
                } catch (error: any) {
                    throw new Error(error);
                }
              },
            credentials: {
                email: { label: "Email", type: "text "},
                password: { label: "Password", type: "password" },
            }
        })
    ],
    pages: {
        signIn: "/signin"
    },
    callbacks: {
        async session({session, token}) {
            session.user._id = token._id;
            session.user.isVerified = token.isVerified;
            session.user.isAcceptingMessages = token.isAcceptingMessages;
            session.user.username = token.username;
            return session
        },
        async jwt({token, user}) {
            if(user){
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token
        }
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
}