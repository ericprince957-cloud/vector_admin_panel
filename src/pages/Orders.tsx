import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { Search, ShoppingCart, Eye, X, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function Orders() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const filteredOrders = state.orders.filter(order => {
    const customer = state.customers.find(c => c.id === order.customer_id);
    const matchSearch = order.reference.toLowerCase().includes(search.toLowerCase()) ||
      customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      customer?.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const selectedOrderData = selectedOrder ? state.orders.find(o => o.id === selectedOrder) : null;
  const selectedCustomer = selectedOrderData ? state.customers.find(c => c.id === selectedOrderData.customer_id) : null;
  const selectedBook = selectedOrderData ? state.books.find(b => b.id === selectedOrderData.book_id) : null;
  const orderDownloads = selectedOrderData ? state.downloads.filter(d => d.order_id === selectedOrderData.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredOrders.length} orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by reference, customer name, or email..." className="input-field pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
            <p className="text-sm text-gray-500">Orders will appear here when customers make purchases.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Order ID</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Book</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => {
                  const customer = state.customers.find(c => c.id === order.customer_id);
                  const book = state.books.find(b => b.id === order.book_id);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-mono text-xs">{order.reference}</td>
                      <td className="table-cell">
                        <div>
                          <p className="font-medium text-gray-900">{customer?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{customer?.email || ''}</p>
                        </div>
                      </td>
                      <td className="table-cell">{book?.title || 'Unknown book'}</td>
                      <td className="table-cell font-medium">{formatCurrency(order.amount)}</td>
                      <td className="table-cell">
                        <span className={`badge ${
                          order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                          order.status === 'REFUNDED' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{order.status}</span>
                      </td>
                      <td className="table-cell text-xs text-gray-500">{format(new Date(order.created_at), 'MMM d, yyyy')}</td>
                      <td className="table-cell">
                        <button onClick={() => setSelectedOrder(order.id)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrderData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Order Reference</p>
                  <p className="text-sm font-mono font-medium">{selectedOrderData.reference}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`badge ${
                    selectedOrderData.status === 'PAID' ? 'bg-green-100 text-green-700' :
                    selectedOrderData.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{selectedOrderData.status}</span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500 mb-1">Customer</p>
                <p className="text-sm font-medium">{selectedCustomer?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-500">{selectedCustomer?.email || ''}</p>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500 mb-1">Book</p>
                <p className="text-sm font-medium">{selectedBook?.title || 'Unknown'}</p>
              </div>
              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-sm font-bold">{formatCurrency(selectedOrderData.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Currency</p>
                  <p className="text-sm">{selectedOrderData.currency}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Payment Provider</p>
                  <p className="text-sm">{selectedOrderData.payment_provider}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Reference</p>
                  <p className="text-sm font-mono text-xs">{selectedOrderData.payment_reference || '—'}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Order Date</p>
                  <p className="text-sm">{format(new Date(selectedOrderData.created_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Paid At</p>
                  <p className="text-sm">{selectedOrderData.paid_at ? format(new Date(selectedOrderData.paid_at), 'MMM d, yyyy h:mm a') : '—'}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500 mb-2">Downloads</p>
                {orderDownloads.length === 0 ? (
                  <p className="text-sm text-gray-400">No downloads yet</p>
                ) : (
                  <div className="space-y-2">
                    {orderDownloads.map(dl => (
                      <div key={dl.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                        <span>{format(new Date(dl.downloaded_at), 'MMM d, yyyy h:mm a')}</span>
                        <span className={`badge ${dl.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{dl.status}</span>
                      </div>
                    ))}
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
