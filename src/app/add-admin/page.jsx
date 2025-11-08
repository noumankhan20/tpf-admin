import React from 'react'
import AdminManagement from '@/components/AddAdmin/Admins'
import { Suspense } from 'react'
const page = () => {
    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <AdminManagement />
            </Suspense>
        </div>
    )
}

export default page