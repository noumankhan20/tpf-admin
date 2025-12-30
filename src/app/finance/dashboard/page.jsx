import React from 'react'
import FinanceDashboard from '@/components/Admin/Finance/FinanceDashboard'

export const metadata = {
    title: 'Finance Dashboard - TPF Admin',
    description: 'Quick summary of foundation funds and expenses.',
}

const DashboardPage = () => {
    return <FinanceDashboard />
}

export default DashboardPage
