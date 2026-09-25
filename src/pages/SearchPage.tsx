import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Search, BookOpen, ShoppingCart, Users, MessageSquare } from 'lucide-react';

export default function SearchPage() {
  const { state } = useApp();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const books = state.books.filter(b => !b.deleted && (
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.tags.some(t => t.toLowerCase().includes(query.toLowerCase())) ||
    b.short_description.toLowerCase().includes(query.toLowerCase())
  ));

  const orders = state.orders.filter(o => {
    const customer = state.customers.find(c => c.id === o.customer_id);
    return o.reference.toLowerCase().includes(query.toLowerCase()) ||
      customer?.name.toLowerCase().includes(query.toLowerCase()) ||
      customer?.email.toLowerCase().includes(query.toLowerCase());
  });

  const customers = state.customers.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.email.toLowerCase().includes(query.toLowerCase())
  );

  const messages = state.messages.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.subject.toLowerCase().includes(query.toLowerCase()) ||
    m.message.toLowerCase().includes(query.toLowerCase())
  );

  const totalResults = books.length + orders.length + customers.length + messages.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
        <p className="text-sm text-gray-500 mt-1">{totalResults} results for "{query}"</p>
      </div>

      {totalResults === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No results found</h3>
          <p className="text-sm text-gray-500">Try different keywords or check spelling.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Books */}
          {books.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h2 className="font-semibold text-gray-900">Books ({books.length})</h2>
              </div>
              <div className="space-y-2">
                {books.slice(0, 5).map(book => (
                  <Link key={book.id} to={`/admin/books/${book.id}`} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{book.title}</p>
                      <p className="text-xs text-gray-500">₦{book.price.toLocaleString()} • {book.status}</p>
                    </div>
                    <span className={`badge ${book.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{book.status}</span>
                  </Link>
                ))}
                {books.length > 5 && <Link to="/admin/books" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View all books →</Link>}
              </div>
            </div>
          )}

          {/* Orders */}
          {orders.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
                <h2 className="font-semibold text-gray-900">Orders ({orders.length})</h2>
              </div>
              <div className="space-y-2">
                {orders.slice(0, 5).map(order => {
                  const customer = state.customers.find(c => c.id === order.customer_id);
                  return (
                    <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 font-mono">{order.reference}</p>
                      </div>
                      <span className={`badge ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customers */}
          {customers.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Customers ({customers.length})</h2>
              </div>
              <div className="space-y-2">
                {customers.slice(0, 5).map(customer => (
                  <div key={customer.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.email}</p>
                    </div>
                    <p className="text-xs text-gray-500">₦{customer.total_spent.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <h2 className="font-semibold text-gray-900">Messages ({messages.length})</h2>
              </div>
              <div className="space-y-2">
                {messages.slice(0, 5).map(msg => (
                  <div key={msg.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{msg.subject}</p>
                      <p className="text-xs text-gray-500">{msg.name} • {msg.email}</p>
                    </div>
                    <span className={`badge ${msg.status === 'UNREAD' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{msg.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
