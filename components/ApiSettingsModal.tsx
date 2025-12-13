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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Server className="text-purple-600" size={24} />
            API Configuration
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Target Endpoint URL
            </label>
            <div className="relative">
                <input 
                    type="url" 
                    value={endpoint} 
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="https://api.example.com/submit"
                    className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                />
                <Server className="absolute left-3 top-3 text-gray-400" size={18} />
            </div>
            <p className="text-xs text-gray-400">
                This is where form submissions will be sent (POST request).
            </p>
          </div>

          {/* Status Message */}
          {status.message && (
            <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {status.type === 'success' ? <Check size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
                {status.message}
            </div>
          )}

          <div className="pt-2">
            <button
                type="submit"
                disabled={isSaving || isLoading}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
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
