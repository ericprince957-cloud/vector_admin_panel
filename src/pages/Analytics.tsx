import { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, startOfWeek, startOfMonth, subMonths } from 'date-fns';

type DateRange = 'today' | '7days' | '30days' | '3months' | '1year' | 'all';

export default function Analytics() {
  const { state } = useApp();
  const [dateRange, setDateRange] = useState<DateRange>('30days');

  const paidOrders = state.orders.filter(o => o.status === 'PAID');

  const getDateRange = (range: DateRange) => {
    const now = new Date();
    switch (range) {
      case 'today': return { start: startOfDay(now), end: endOfDay(now) };
      case '7days': return { start: subDays(now, 7), end: now };
      case '30days': return { start: subDays(now, 30), end: now };
      case '3months': return { start: subMonths(now, 3), end: now };
      case '1year': return { start: subMonths(now, 12), end: now };
      case 'all': return { start: new Date(2020, 0, 1), end: now };
    }
  };

  const range = getDateRange(dateRange);
  const ordersInRange = paidOrders.filter(o => {
    const date = new Date(o.created_at);
    return isWithinInterval(date, range);
  });

  const revenueToday = paidOrders.filter(o => isWithinInterval(new Date(o.created_at), { start: startOfDay(new Date()), end: endOfDay(new Date()) })).reduce((s, o) => s + o.amount, 0);
  const revenueWeek = paidOrders.filter(o => isWithinInterval(new Date(o.created_at), { start: startOfWeek(new Date()), end: new Date() })).reduce((s, o) => s + o.amount, 0);
  const revenueMonth = paidOrders.filter(o => isWithinInterval(new Date(o.created_at), { start: startOfMonth(new Date()), end: new Date() })).reduce((s, o) => s + o.amount, 0);
  const totalRevenue = paidOrders.reduce((s, o) => s + o.amount, 0);

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;

  // Generate chart data
  const chartData = useMemo(() => {
    const data: { date: string; revenue: number; orders: number }[] = [];
    const days = dateRange === 'today' ? 1 : dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : dateRange === '3months' ? 90 : dateRange === '1year' ? 365 : 365;

    for (let i = days - 1; i >= 0; i--) {
      const day = subDays(new Date(), i);
      const dayStr = format(day, 'MMM d');
      const dayOrders = paidOrders.filter(o => format(new Date(o.created_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
      data.push({
        date: dayStr,
        revenue: dayOrders.reduce((s, o) => s + o.amount, 0),
        orders: dayOrders.length,
      });
    }
    return data;
  }, [dateRange, paidOrders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Revenue and performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <select className="input-field w-auto" value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRange)}>
            <option value="today">Today</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="3months">Last 3 months</option>
            <option value="1year">Last year</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Today</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(revenueToday)}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">This Week</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(revenueWeek)}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">This Month</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(revenueMonth)}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h2>
        {ordersInRange.length === 0 && paidOrders.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">No revenue data yet. Revenue is calculated from verified paid orders only.</p>
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} interval={Math.max(0, Math.floor(chartData.length / 7))} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Orders Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders Over Time</h2>
        {paidOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No order data yet.</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} interval={Math.max(0, Math.floor(chartData.length / 7))} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Total Orders</span>
              <span className="text-sm font-semibold">{state.orders.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Paid</span>
              <span className="text-sm font-semibold text-green-600">{state.orders.filter(o => o.status === 'PAID').length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-sm font-semibold text-yellow-600">{state.orders.filter(o => o.status === 'PENDING').length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Failed</span>
              <span className="text-sm font-semibold text-red-600">{state.orders.filter(o => o.status === 'FAILED').length}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Cancelled</span>
              <span className="text-sm font-semibold text-gray-600">{state.orders.filter(o => o.status === 'CANCELLED').length}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Books</h2>
          {(() => {
            const bookSales: Record<string, { title: string; count: number; revenue: number }> = {};
            paidOrders.forEach(o => {
              const book = state.books.find(b => b.id === o.book_id);
              if (book) {
                if (!bookSales[o.book_id]) bookSales[o.book_id] = { title: book.title, count: 0, revenue: 0 };
                bookSales[o.book_id].count++;
                bookSales[o.book_id].revenue += o.amount;
              }
            });
            const sorted = Object.values(bookSales).sort((a, b) => b.count - a.count).slice(0, 5);
            return sorted.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No sales data yet</p>
            ) : (
              <div className="space-y-3">
                {sorted.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{item.title}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{item.count} sold</p>
                      <p className="text-xs text-gray-500">{formatCurrency(item.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
