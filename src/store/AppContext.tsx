import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR';
  avatar?: string;
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  photo?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  book_count: number;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  author_id: string;
  category_id: string;
  short_description: string;
  description: string;
  cover_url?: string;
  book_file_path?: string;
  preview_file_path?: string;
  price: number;
  original_price?: number;
  featured: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';
  what_you_learn: string[];
  table_of_contents: string[];
  tags: string[];
  published_at?: string;
  created_at: string;
  updated_at: string;
  deleted?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  created_at: string;
  total_purchases: number;
  total_spent: number;
  last_purchase?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  book_id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  payment_provider: string;
  payment_reference?: string;
  created_at: string;
  paid_at?: string;
}

export interface Download {
  id: string;
  order_id: string;
  customer_id: string;
  book_id: string;
  downloaded_at: string;
  status: 'ACTIVE' | 'REVOKED';
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'UNREAD' | 'READ' | 'RESOLVED';
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  created_at: string;
}

export interface StoreSettings {
  store_name: string;
  store_description: string;
  support_email: string;
  whatsapp_number: string;
  currency: string;
  logo?: string;
  paystack_public_key: string;
  paystack_configured: boolean;
  sender_name: string;
  sender_email: string;
  email_configured: boolean;
  refund_policy: string;
  terms: string;
  privacy_policy: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  books: Book[];
  authors: Author[];
  categories: Category[];
  customers: Customer[];
  orders: Order[];
  downloads: Download[];
  messages: Message[];
  activityLogs: ActivityLog[];
  settings: StoreSettings;
  loading: boolean;
}

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_BOOK'; payload: Book }
  | { type: 'UPDATE_BOOK'; payload: Book }
  | { type: 'DELETE_BOOK'; payload: string }
  | { type: 'ADD_AUTHOR'; payload: Author }
  | { type: 'UPDATE_AUTHOR'; payload: Author }
  | { type: 'DELETE_AUTHOR'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { id: string; status: Order['status'] } }
  | { type: 'ADD_DOWNLOAD'; payload: Download }
  | { type: 'REVOKE_DOWNLOAD'; payload: string }
  | { type: 'UPDATE_MESSAGE_STATUS'; payload: { id: string; status: Message['status'] } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<StoreSettings> }
  | { type: 'ADD_ACTIVITY_LOG'; payload: ActivityLog };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  books: [],
  authors: [],
  categories: [],
  customers: [],
  orders: [],
  downloads: [],
  messages: [],
  activityLogs: [],
  settings: {
    store_name: 'Digital Bookstore',
    store_description: 'Premium ebooks for Nigerian readers',
    support_email: 'support@digitalbookstore.ng',
    whatsapp_number: '+234 801 234 5678',
    currency: 'NGN',
    paystack_public_key: 'pk_test_****',
    paystack_configured: true,
    sender_name: 'Digital Bookstore',
    sender_email: 'noreply@digitalbookstore.ng',
    email_configured: true,
    refund_policy: 'All sales are final. Refunds are only issued for technical issues with purchased ebooks.',
    terms: 'By purchasing from our store, you agree to our terms of service.',
    privacy_policy: 'We respect your privacy and will never share your personal information.',
  },
  loading: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'ADD_BOOK':
      return { ...state, books: [...state.books, action.payload] };
    case 'UPDATE_BOOK':
      return { ...state, books: state.books.map(b => b.id === action.payload.id ? action.payload : b) };
    case 'DELETE_BOOK':
      return { ...state, books: state.books.map(b => b.id === action.payload ? { ...b, deleted: true } : b) };
    case 'ADD_AUTHOR':
      return { ...state, authors: [...state.authors, action.payload] };
    case 'UPDATE_AUTHOR':
      return { ...state, authors: state.authors.map(a => a.id === action.payload.id ? action.payload : a) };
    case 'DELETE_AUTHOR':
      return { ...state, authors: state.authors.filter(a => a.id !== action.payload) };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return { ...state, categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };
    case 'UPDATE_ORDER_STATUS':
      return { ...state, orders: state.orders.map(o => o.id === action.payload.id ? { ...o, status: action.payload.status } : o) };
    case 'ADD_DOWNLOAD':
      return { ...state, downloads: [...state.downloads, action.payload] };
    case 'REVOKE_DOWNLOAD':
      return { ...state, downloads: state.downloads.map(d => d.id === action.payload ? { ...d, status: 'REVOKED' as const } : d) };
    case 'UPDATE_MESSAGE_STATUS':
      return { ...state, messages: state.messages.map(m => m.id === action.payload.id ? { ...m, status: action.payload.status } : m) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'ADD_ACTIVITY_LOG':
      return { ...state, activityLogs: [action.payload, ...state.activityLogs].slice(0, 100) };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

// Helper to generate activity log
export function createActivityLog(userId: string, userName: string, action: string, resourceType: string, resourceId?: string): ActivityLog {
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    user_name: userName,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    created_at: new Date().toISOString(),
  };
}
