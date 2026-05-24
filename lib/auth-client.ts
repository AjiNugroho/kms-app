import { createAuthClient } from "better-auth/react" // make sure to import from better-auth/react
import { usernameClient } from "better-auth/client/plugins"
import { adminClient } from "better-auth/client/plugins"
import { ac,superadmin,kader,normaluser } from "@/lib/permission";
export const authClient =  createAuthClient({
    plugins:[
        usernameClient(),
        adminClient({
            ac,
            roles: {
                superadmin,
                kader,
                normaluser  
            },
            defaultRole: "normaluser"
        })
    ]
})