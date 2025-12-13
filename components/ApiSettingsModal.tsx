import React, { useState, useEffect } from 'react';
import { Settings, X, Save, AlertCircle, Check, Server } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApiSettingsModal({ isOpen, onClose }: ApiSettingsModalProps) {
  const [endpoint, setEndpoint] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setEndpoint(data.endpoint || '');
      }
    } catch (error) {
      console.error('Failed to load settings', error);
      setStatus({ type: 'error', message: 'Failed to load current settings' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus({ type: null, message: '' });

    try {
        // Basic URL validation
        if (endpoint && !endpoint.startsWith('http')) {
             setStatus({ type: 'error', message: 'URL must start with http:// or https://' });
             setIsSaving(false);
             return;
        }

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint }),
      });

      if (!res.ok) {
        throw new Error('Failed to save settings');
      }

      setStatus({ type: 'success', message: 'API Endpoint saved successfully' });
      
      // Auto close after success (optional, but nice)
      setTimeout(() => {
          onClose();
          setStatus({ type: null, message: '' });
      }, 1500);

    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Error saving settings' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md transition-all">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/20">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100/50">
          <h2 className="text-xl font-semibold text-[#1d1d1f] flex items-center gap-2 tracking-tight">
            <Server className="text-[#0071e3]" size={22} />
            API Configuration
          </h2>
          <button onClick={onClose} className="text-[#86868b] hover:text-[#1d1d1f] bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-[#1d1d1f] uppercase tracking-wide">
                Target Endpoint URL
            </label>
            <div className="relative">
                <input 
                    type="url" 
                    value={endpoint} 
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="https://api.example.com/submit"
                    className="w-full p-4 pl-11 bg-[#f5f5f7] border-none rounded-xl text-sm text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/20 focus:bg-white outline-none transition-all placeholder-gray-400 font-medium"
                />
                <Server className="absolute left-4 top-4 text-[#86868b]" size={18} />
            </div>
            <p className="text-[11px] text-[#86868b]">
                This is where form submissions will be sent (POST request).
            </p>
          </div>

          {/* Status Message */}
          {status.message && (
            <div className={`p-3 rounded-xl text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-1 ${status.type === 'success' ? 'bg-[#34c759]/10 text-[#34c759]' : 'bg-[#ff3b30]/10 text-[#ff3b30]'}`}>
                {status.type === 'success' ? <Check size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
                <span className="font-medium">{status.message}</span>
            </div>
          )}

          <div className="pt-2">
            <button
                type="submit"
                disabled={isSaving || isLoading}
                className="w-full py-3.5 px-4 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full font-semibold text-[15px] shadow-sm hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSaving ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save size={18} />
                        Save Configuration
                    </>
                )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
