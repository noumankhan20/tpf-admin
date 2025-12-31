import { X, Calendar, CreditCard, User, FileText, Banknote, Receipt } from 'lucide-react';

const DetailsModal = ({ data, type, onClose }) => {
  if (!data) return null;

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 text-gray-400">
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-sm text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (type === "salary") {
      return (
        <>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 rounded-xl">
                <Banknote className="text-emerald-600" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Salary Payment</p>
                <p className="text-3xl font-bold text-gray-900">₹{data.amount.toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Close modal"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <DetailRow 
              icon={FileText} 
              label="Description" 
              value={data.description} 
            />
            <DetailRow 
              icon={User} 
              label="Administrator" 
              value={`${data.adminId.fullName} • ${data.adminId.email}`} 
            />
            <DetailRow 
              icon={CreditCard} 
              label="Payment Method" 
              value={data.paymentMethod} 
            />
            <DetailRow 
              icon={Calendar} 
              label="Payment Date" 
              value={new Date(data.createdAt).toLocaleDateString('en-IN', { 
                day: 'numeric',
                month: 'long', 
                year: 'numeric'
              })} 
            />
          </div>
        </>
      );
    } else if (type === "expense") {
      return (
        <>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 rounded-xl">
                <Receipt className="text-emerald-600" size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Expense</p>
                <p className="text-3xl font-bold text-gray-900">₹{data.amount.toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Close modal"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <DetailRow 
              icon={FileText} 
              label="Description" 
              value={data.description} 
            />
            <DetailRow 
              icon={User} 
              label="Reimbursed To" 
              value={`${data.reimbursementTo.adminId.fullName} • ${data.reimbursementTo.adminId.email}`} 
            />
            <DetailRow 
              icon={CreditCard} 
              label="Payment Method" 
              value={data.paymentMethod} 
            />
            <DetailRow 
              icon={Calendar} 
              label="Date" 
              value={new Date(data.createdAt).toLocaleDateString('en-IN', { 
                day: 'numeric',
                month: 'long', 
                year: 'numeric'
              })} 
            />
          </div>
        </>
      );
    }
  };

  return (
    <div 
      className="fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {renderContent()}
          
          <button 
            onClick={onClose} 
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 active:scale-[0.98] transition-all mt-6 shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;