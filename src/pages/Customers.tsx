import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Search, Users, Eye, X } from 'lucide-react';
import { format } from 'date-fns';

export default function Customers() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const filteredCustomers = state.customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const selectedCustomerData = selectedCustomer ? state.customers.find(c => c.id === selectedCustomer) : null;
  const customerOrders = selectedCustomer ? state.orders.filter(o => o.customer_id === selectedCustomer) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredCustomers.length} customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name or email..." className="input-field pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No customers yet</h3>
            <p className="text-sm text-gray-500">Customers will appear here when they register and make purchases.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Registered</th>
                  <th className="table-header">Purchases</th>
                  <th className="table-header">Total Spent</th>
                  <th className="table-header">Last Purchase</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-700">{customer.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell text-xs text-gray-500">{format(new Date(customer.created_at), 'MMM d, yyyy')}</td>
                    <td className="table-cell font-medium">{customer.total_purchases}</td>
                    <td className="table-cell font-medium">{formatCurrency(customer.total_spent)}</td>
                    <td className="table-cell text-xs text-gray-500">{customer.last_purchase ? format(new Date(customer.last_purchase), 'MMM d, yyyy') : '—'}</td>
                    <td className="table-cell">
                      <button onClick={() => setSelectedCustomer(customer.id)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomerData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Customer Details</h3>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-indigo-700">{selectedCustomerData.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-lg font-semibold">{selectedCustomerData.name}</p>
                  <p className="text-sm text-gray-500">{selectedCustomerData.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{selectedCustomerData.total_purchases}</p>
                  <p className="text-xs text-gray-500">Purchases</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedCustomerData.total_spent)}</p>
                  <p className="text-xs text-gray-500">Total Spent</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{selectedCustomerData.last_purchase ? format(new Date(selectedCustomerData.last_purchase), 'MMM d') : '—'}</p>
                  <p className="text-xs text-gray-500">Last Purchase</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Purchase History</p>
                {customerOrders.length === 0 ? (
                  <p className="text-sm text-gray-400">No purchases yet</p>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map(order => {
                      const book = state.books.find(b => b.id === order.book_id);
                      return (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{book?.title || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{format(new Date(order.created_at), 'MMM d, yyyy')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(order.amount)}</p>
                            <span className={`badge text-xs ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
