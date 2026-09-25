import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp, createActivityLog } from '../store/AppContext';
import { BookOpen, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));

    // Demo credentials
    if (email === 'admin@bookstore.ng' && password === 'admin123') {
      const user = { id: '1', email, name: 'Admin User', role: 'ADMIN' as const };
      dispatch({ type: 'LOGIN', payload: user });
      dispatch({ type: 'ADD_ACTIVITY_LOG', payload: createActivityLog('1', 'Admin User', 'Logged in', 'auth') });
      navigate('/admin');
    } else if (email === 'editor@bookstore.ng' && password === 'editor123') {
      const user = { id: '2', email, name: 'Editor User', role: 'EDITOR' as const };
      dispatch({ type: 'LOGIN', payload: user });
      dispatch({ type: 'ADD_ACTIVITY_LOG', payload: createActivityLog('2', 'Editor User', 'Logged in', 'auth') });
      navigate('/admin');
    } else {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setResetSent(true);
    setLoading(false);
  };

  if (view === 'forgot') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Reset Password</h1>
              <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset link</p>
            </div>
            {resetSent ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-sm text-gray-600 mb-4">Password reset link sent to <strong>{resetEmail}</strong></p>
                <p className="text-xs text-gray-400 mb-6">Check your email inbox and follow the instructions.</p>
                <button onClick={() => { setView('login'); setResetSent(false); }} className="btn-primary w-full">Back to Login</button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" required className="input-field" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="admin@bookstore.ng" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full mb-3">{loading ? 'Sending...' : 'Send Reset Link'}</button>
                <button type="button" onClick={() => setView('login')} className="btn-secondary w-full flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
              </form>
            )}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">© 2024 Digital Bookstore. Admin access only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to manage your bookstore</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bookstore.ng"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="rounded border-gray-300" />
                Remember me
              </label>
              <button type="button" onClick={() => setView('forgot')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium mb-1">Demo Credentials:</p>
            <p className="text-xs text-gray-500">Admin: admin@bookstore.ng / admin123</p>
            <p className="text-xs text-gray-500">Editor: editor@bookstore.ng / editor123</p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">© 2024 Digital Bookstore. Admin access only.</p>
      </div>
    </div>
  );
}
