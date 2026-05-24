import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle"; // your drizzle instance
import { username } from "better-auth/plugins"
import { schema } from "@/db/auth-schema"; // your auth schema

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", 
        schema
    }),
    emailAndPassword: { 
        enabled: true, 
    }, 
    plugins: [ 
        username() 
    ]

});