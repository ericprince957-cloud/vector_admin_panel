import { useState } from 'react';
import { useApp } from '../store/AppContext';
import { MessageSquare, Search, Eye, CheckCircle, Mail } from 'lucide-react';
import { format } from 'date-fns';

export default function Messages() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const filteredMessages = state.messages.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const selectedMsg = selectedMessage ? state.messages.find(m => m.id === selectedMessage) : null;

  const handleMarkRead = (id: string) => {
    dispatch({ type: 'UPDATE_MESSAGE_STATUS', payload: { id, status: 'READ' } });
  };

  const handleMarkResolved = (id: string) => {
    dispatch({ type: 'UPDATE_MESSAGE_STATUS', payload: { id, status: 'RESOLVED' } });
    setSelectedMessage(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">{state.messages.filter(m => m.status === 'UNREAD').length} unread</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search messages..." className="input-field pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No messages</h3>
            <p className="text-sm text-gray-500">Contact form submissions will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMessages.map(msg => (
              <div
                key={msg.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${msg.status === 'UNREAD' ? 'bg-indigo-50/30' : ''}`}
                onClick={() => { setSelectedMessage(msg.id); if (msg.status === 'UNREAD') handleMarkRead(msg.id); }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.status === 'UNREAD' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                      <Mail className={`w-5 h-5 ${msg.status === 'UNREAD' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${msg.status === 'UNREAD' ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{msg.name}</p>
                        <span className={`badge ${msg.status === 'UNREAD' ? 'bg-blue-100 text-blue-700' : msg.status === 'READ' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>{msg.status}</span>
                      </div>
                      <p className="text-xs text-gray-500">{msg.email}</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{msg.subject}</p>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{msg.message}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">{format(new Date(msg.created_at), 'MMM d')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedMsg.subject}</h3>
                <p className="text-sm text-gray-500">{selectedMsg.name} ({selectedMsg.email})</p>
                <p className="text-xs text-gray-400 mt-1">{format(new Date(selectedMsg.created_at), 'MMMM d, yyyy h:mm a')}</p>
              </div>
              <span className={`badge ${selectedMsg.status === 'UNREAD' ? 'bg-blue-100 text-blue-700' : selectedMsg.status === 'READ' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>{selectedMsg.status}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedMsg.message}</p>
            </div>
            <div className="flex gap-3">
              {selectedMsg.status !== 'RESOLVED' && (
                <button onClick={() => handleMarkResolved(selectedMsg.id)} className="btn-primary flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Mark Resolved
                </button>
              )}
              <button onClick={() => setSelectedMessage(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
