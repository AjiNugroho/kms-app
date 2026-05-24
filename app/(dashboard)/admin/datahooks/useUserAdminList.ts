// import { auth } from '@/lib/auth-client';
'use client'
import { authClient } from '@/lib/auth-client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export type UserShown = {
    id:string;
    name:string;
    email:string;
    createdAt:string;
    role:string;
}

export function useAdminListData() {

    const queryKey = ['admin-user-list'];

    const queryFn = async()=>{
        const dataAdmin:UserShown[]=[]

        const {data} = await authClient.admin.listUsers({
            query:{
                filterField:'role',
                filterValue:'superadmin',
                filterOperator:'ne'
            }
        })

        if(data?.users){
            data.users.map(usr=>{
                dataAdmin.push({
                    id:usr.id,
                    name:usr.name,
                    email:usr.email,
                    role:usr.role||'',
                    createdAt:usr.createdAt.toISOString()
                }
                )
            })
        }

        return {...data,users:dataAdmin}
    }

    return useQuery({
        queryKey,
        queryFn,
        placeholderData:keepPreviousData,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}