import { z } from "zod";

export const acceptMessageSchema = z.object({
    content: z
    .string()
    .min(8, "Message must be at least 8 characters long")
    .max(300, "Message must be at most 300 characters long") 
})