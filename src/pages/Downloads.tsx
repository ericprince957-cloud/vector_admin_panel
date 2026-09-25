import { useState } from 'react';
import { useApp, createActivityLog } from '../store/AppContext';
import { Download, Search, Ban, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Downloads() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);

  const filteredDownloads = state.downloads.filter(d => {
    const customer = state.customers.find(c => c.id === d.customer_id);
    const book = state.books.find(b => b.id === d.book_id);
    return customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      book?.title.toLowerCase().includes(search.toLowerCase());
  }).sort((a, b) => new Date(b.downloaded_at).getTime() - new Date(a.downloaded_at).getTime());

  const handleRevoke = (id: string) => {
    dispatch({ type: 'REVOKE_DOWNLOAD', payload: id });
    if (state.user) {
      dispatch({ type: 'ADD_ACTIVITY_LOG', payload: createActivityLog(state.user.id, state.user.name, 'Revoked download access', 'download', id) });
    }
    setRevokeConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Downloads</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredDownloads.length} downloads tracked</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by customer or book..." className="input-field pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Downloads Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredDownloads.length === 0 ? (
          <div className="text-center py-16">
            <Download className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No downloads yet</h3>
            <p className="text-sm text-gray-500">Downloads will be tracked when customers access their purchased ebooks.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Book</th>
                  <th className="table-header">Order</th>
                  <th className="table-header">Download Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDownloads.map(dl => {
                  const customer = state.customers.find(c => c.id === dl.customer_id);
                  const book = state.books.find(b => b.id === dl.book_id);
                  const order = state.orders.find(o => o.id === dl.order_id);
                  return (
                    <tr key={dl.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <p className="font-medium text-gray-900">{customer?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{customer?.email || ''}</p>
                      </td>
                      <td className="table-cell">{book?.title || 'Unknown'}</td>
                      <td className="table-cell font-mono text-xs">{order?.reference || '—'}</td>
                      <td className="table-cell text-xs text-gray-500">{format(new Date(dl.downloaded_at), 'MMM d, yyyy h:mm a')}</td>
                      <td className="table-cell">
                        <span className={`badge ${dl.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {dl.status === 'ACTIVE' ? <><CheckCircle className="w-3 h-3 mr-1" />Active</> : <><Ban className="w-3 h-3 mr-1" />Revoked</>}
                        </span>
                      </td>
                      <td className="table-cell">
                        {dl.status === 'ACTIVE' && (
                          <button onClick={() => setRevokeConfirm(dl.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">
                            Revoke Access
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revoke Confirmation */}
      {revokeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Revoke download access?</h3>
            <p className="text-sm text-gray-600 mb-4">The customer will no longer be able to download this book. This action can be reversed by the system administrator.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRevokeConfirm(null)} className="btn-secondary">Cancel</button>
              <button onClick={() => handleRevoke(revokeConfirm)} className="btn-danger">Revoke Access</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
