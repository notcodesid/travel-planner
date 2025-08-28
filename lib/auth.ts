import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { PrismaClient } from "@prisma/client";
 
// const prisma = new PrismaClient();

export const auth = betterAuth({
    // For now, just basic configuration without database
    emailAndPassword: {
        enabled: true, 
    }, 
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || "test", 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "test", 
        }, 
    }, 
});