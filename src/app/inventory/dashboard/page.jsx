import React from 'react'
import InventoryDashboard from '@/components/Finance/Inventory/Dashboard/InventoryDashboard'

export const metadata = {
    title: 'Inventory Dashboard - TPF Admin',
    description: 'Quick summary of assets and inventory stock.',
}

const DashboardPage = () => {
    return <InventoryDashboard />
}

export default DashboardPage
