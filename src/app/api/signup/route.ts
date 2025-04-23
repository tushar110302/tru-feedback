import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/models/user";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request){
    await dbConnect();
    try {
        const {username, email, password} = await request.json();

        const existingUserByUsername = await UserModel.findOne({username, isVerified:true});
        if(existingUserByUsername){
            return Response.json({
                success: false,
                message: "Username already exists",
            },
            { status: 400 }
            );
        }
        const existingUserByEmail = await UserModel.findOne({email});
        const verifyCode = Math.floor(Math.random() * 1000000).toString();

        if(existingUserByEmail){
            if(existingUserByEmail.isVerified){
                return Response.json({
                    success: false,
                    message: "Usern already exists with this email",
                },
                { status: 400 }
                );
            }
            else{
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserByEmail.save();
            }
        }
        else{
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getHours() + 1);

            const neewUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: []
            })
            await neewUser.save();
        }

        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: "Error in sending verification email",
            },
            { status: 500 }
            );
        }

        return Response.json({
            success: true,
            message: "User created successfully. Verification email sent.",
        }, { status: 201 });
    } catch (error) {
        console.error("Error in signup route", error);
        return Response.json({
            success: false,
            message: "Error in signup route",
        },
        { status: 500 }
        );
    }
}