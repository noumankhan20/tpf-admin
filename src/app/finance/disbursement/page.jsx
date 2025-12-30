import DisbursementManagement from '@/components/Admin/Finance/DisbursementManagement';

export const metadata = {
    title: 'Disbursement Tasks | TPF Admin',
    description: 'Process beneficiary payments and disbursements',
};

export default function DisbursementPage() {
    return <DisbursementManagement />;
}
