import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document {
    content: string,
    createdAt: Date
}

const messageSchema: Schema<Message> = new Schema({
    content: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        required: true,
        default: Date.now 
    }
});

export interface User extends Document {
    username: String,
    email: String,
    password: String,
    verifyCode: String,
    verifyCodeExpiry: Date,
    isVerified: boolean,
    isAcceptingMessages: boolean,
    messages: Message[]
}

const userSchema: Schema<User> = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        match: [/^[\w.-]+@[\w.-]+\.\w{2,}$/, "Please enter a valid email address"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    verifyCode: {
        type: String,
        required: [true, "Verification code is required"]
    },
    verifyCodeExpiry: {
        type: Date,
        required: [true, "Verification code expiry is required"]
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAcceptingMessages: {
        type: Boolean,
        default: false
    },
    messages: [messageSchema]
})

export const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", userSchema);