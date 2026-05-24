import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
    ...defaultStatements, 
    kids: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const superadmin = ac.newRole({
    kids:['create', 'read', 'update', 'delete'],
    ...adminAc.statements
})

export const kader = ac.newRole({
    kids:['read','create','update']
})

export const normaluser = ac.newRole({
    kids:['read']
})