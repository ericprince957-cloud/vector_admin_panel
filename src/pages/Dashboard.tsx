import { useApp } from '../store/AppContext';
import { BookOpen, ShoppingCart, Users, Download, TrendingUp, DollarSign, FileText, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const { state } = useApp();

  const totalBooks = state.books.filter(b => !b.deleted).length;
  const publishedBooks = state.books.filter(b => b.status === 'PUBLISHED' && !b.deleted).length;
  const draftBooks = state.books.filter(b => b.status === 'DRAFT' && !b.deleted).length;
  const totalOrders = state.orders.length;
  const paidOrders = state.orders.filter(o => o.status === 'PAID').length;
  const pendingOrders = state.orders.filter(o => o.status === 'PENDING').length;
  const totalCustomers = state.customers.length;
  const totalRevenue = state.orders.filter(o => o.status === 'PAID').reduce((sum, o) => sum + o.amount, 0);
  const totalDownloads = state.downloads.filter(d => d.status === 'ACTIVE').length;

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  const stats = [
    { label: 'Total Books', value: totalBooks, icon: BookOpen, color: 'bg-blue-50 text-blue-600', link: '/admin/books' },
    { label: 'Published', value: publishedBooks, icon: Eye, color: 'bg-green-50 text-green-600', link: '/admin/books?status=published' },
    { label: 'Drafts', value: draftBooks, icon: FileText, color: 'bg-yellow-50 text-yellow-600', link: '/admin/books?status=draft' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'bg-purple-50 text-purple-600', link: '/admin/orders' },
    { label: 'Paid Orders', value: paidOrders, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600', link: '/admin/orders?status=paid' },
    { label: 'Pending', value: pendingOrders, icon: TrendingUp, color: 'bg-orange-50 text-orange-600', link: '/admin/orders?status=pending' },
    { label: 'Customers', value: totalCustomers, icon: Users, color: 'bg-indigo-50 text-indigo-600', link: '/admin/customers' },
    { label: 'Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'bg-teal-50 text-teal-600', link: '/admin/analytics' },
    { label: 'Downloads', value: totalDownloads, icon: Download, color: 'bg-pink-50 text-pink-600', link: '/admin/downloads' },
  ];

  const recentOrders = [...state.orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  const recentBooks = [...state.books].filter(b => !b.deleted).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 5);
  const recentActivity = state.activityLogs.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {state.user?.name || 'Admin'}. Here's what's happening.</p>
        </div>
        <Link to="/admin/books/new" className="btn-primary">+ Add New Book</Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.link} className="stat-card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
          </div>
          <div className="p-4">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(order => {
                  const customer = state.customers.find(c => c.id === order.customer_id);
                  const book = state.books.find(b => b.id === order.book_id);
                  return (
                    <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{book?.title || 'Unknown book'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(order.amount)}</p>
                        <span className={`badge ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Books */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Books</h2>
            <Link to="/admin/books" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
          </div>
          <div className="p-4">
            {recentBooks.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No books yet. Create your first book!</p>
            ) : (
              <div className="space-y-3">
                {recentBooks.map(book => {
                  const author = state.authors.find(a => a.id === book.author_id);
                  return (
                    <div key={book.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{book.title}</p>
                        <p className="text-xs text-gray-500">{author?.name || 'Unknown author'} • {formatCurrency(book.price)}</p>
                      </div>
                      <span className={`badge ${book.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : book.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                        {book.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          <Link to="/admin/activity-log" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
        </div>
        <div className="p-4">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map(log => (
                <div key={log.id} className="flex items-start gap-3 py-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-gray-600">{log.user_name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900"><span className="font-medium">{log.user_name}</span> {log.action}</p>
                    <p className="text-xs text-gray-500">{log.resource_type} {log.created_at ? `• ${format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
