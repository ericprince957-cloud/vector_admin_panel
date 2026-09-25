import { useState } from 'react';
import { useApp, createActivityLog } from '../store/AppContext';
import { Save, Store, CreditCard, Mail, Shield, CheckCircle } from 'lucide-react';

type Tab = 'store' | 'payment' | 'email' | 'policies';

export default function Settings() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('store');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const [storeName, setStoreName] = useState(state.settings.store_name);
  const [storeDesc, setStoreDesc] = useState(state.settings.store_description);
  const [supportEmail, setSupportEmail] = useState(state.settings.support_email);
  const [whatsapp, setWhatsapp] = useState(state.settings.whatsapp_number);
  const [currency] = useState(state.settings.currency);
  const [paystackPubKey, setPaystackPubKey] = useState(state.settings.paystack_public_key);
  const [senderName, setSenderName] = useState(state.settings.sender_name);
  const [senderEmail, setSenderEmail] = useState(state.settings.sender_email);
  const [refundPolicy, setRefundPolicy] = useState(state.settings.refund_policy);
  const [terms, setTerms] = useState(state.settings.terms);
  const [privacy, setPrivacy] = useState(state.settings.privacy_policy);

  const tabs: { id: Tab; label: string; icon: typeof Store }[] = [
    { id: 'store', label: 'Store Settings', icon: Store },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'policies', label: 'Policies', icon: Shield },
  ];

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));

    const updates: Record<string, string> = {};
    if (activeTab === 'store') {
      updates.store_name = storeName;
      updates.store_description = storeDesc;
      updates.support_email = supportEmail;
      updates.whatsapp_number = whatsapp;
    } else if (activeTab === 'payment') {
      updates.paystack_public_key = paystackPubKey;
    } else if (activeTab === 'email') {
      updates.sender_name = senderName;
      updates.sender_email = senderEmail;
    } else if (activeTab === 'policies') {
      updates.refund_policy = refundPolicy;
      updates.terms = terms;
      updates.privacy_policy = privacy;
    }

    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
    if (state.user) {
      dispatch({ type: 'ADD_ACTIVITY_LOG', payload: createActivityLog(state.user.id, state.user.name, `Updated ${activeTab} settings`, 'settings') });
    }
    setSaving(false);
    setToast('Settings saved successfully!');
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your bookstore</p>
        </div>
      </div>

      {toast && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Store Settings */}
      {activeTab === 'store' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Store Settings</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input type="text" className="input-field" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
            <textarea className="input-field h-20 resize-none" value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input type="email" className="input-field" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
              <input type="text" className="input-field" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select className="input-field" value={currency} disabled>
              <option value="NGN">NGN (₦ Nigerian Naira)</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">Currency is set at the system level</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                <Store className="w-8 h-8 text-gray-400" />
              </div>
              <label className="btn-secondary cursor-pointer text-sm">Upload Logo<input type="file" accept="image/*" className="hidden" /></label>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payment' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Payment Settings</h2>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">Paystack Integration</p>
            <p className="text-xs text-blue-600 mt-1">Payments are processed securely through Paystack. The secret key is stored server-side and never exposed to the frontend.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paystack Public Key</label>
            <input type="text" className="input-field font-mono" value={paystackPubKey} onChange={(e) => setPaystackPubKey(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">This key is safe to use on the frontend</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paystack Secret Key</label>
            <input type="password" className="input-field font-mono" value="sk_live_••••••••••••••••••••" disabled />
            <p className="text-xs text-gray-400 mt-1">⚠️ Secret key is configured via environment variable (PAYSTACK_SECRET_KEY) and cannot be viewed here</p>
          </div>
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">Payment configuration active</span>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === 'email' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Email Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label>
              <input type="text" className="input-field" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sender Email</label>
              <input type="email" className="input-field" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">Email service configured and active</span>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Policies */}
      {activeTab === 'policies' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Store Policies</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Refund Policy</label>
            <textarea className="input-field h-28 resize-y" value={refundPolicy} onChange={(e) => setRefundPolicy(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Terms of Service</label>
            <textarea className="input-field h-28 resize-y" value={terms} onChange={(e) => setTerms(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Policy</label>
            <textarea className="input-field h-28 resize-y" value={privacy} onChange={(e) => setPrivacy(e.target.value)} />
          </div>
          <div className="pt-4 border-t border-gray-100">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
