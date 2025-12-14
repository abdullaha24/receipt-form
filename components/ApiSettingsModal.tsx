import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Check, Server } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-[var(--shadow-modal)] w-full max-w-md overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 sm:p-6 border-b border-[var(--apple-gray-200)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--apple-blue)]/10 rounded-xl">
              <Server className="text-[var(--apple-blue)]" size={22} strokeWidth={1.75} />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--apple-text)] tracking-tight">
              API Configuration
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-[var(--apple-text-secondary)] hover:text-[var(--apple-text)] 
              bg-[var(--apple-gray-100)] hover:bg-[var(--apple-gray-200)] p-2.5 rounded-full transition-all duration-200"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--apple-text)] uppercase tracking-wide">
              Target Endpoint URL
            </label>
            <div className="relative">
              <input 
                type="url" 
                value={endpoint} 
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://api.example.com/submit"
                className="w-full py-3.5 px-4 pl-12 bg-[var(--apple-gray-100)] border-2 border-transparent rounded-xl 
                  text-sm text-[var(--apple-text)] font-medium
                  focus:bg-white focus:border-[var(--apple-blue)] focus:ring-4 focus:ring-[var(--apple-blue)]/10 
                  transition-all duration-200 outline-none placeholder-[var(--apple-text-secondary)]"
              />
              <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--apple-text-secondary)]" size={18} strokeWidth={1.75} />
            </div>
            <p className="text-xs text-[var(--apple-text-secondary)]">
              This is where form submissions will be sent (POST request).
            </p>
          </div>

          {/* Status Message */}
          {status.message && (
            <div className={`p-3.5 rounded-xl text-sm flex items-start gap-2.5 animate-slide-up
              ${status.type === 'success' 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                : 'bg-red-50 text-red-600 border border-red-200'
              }`}
            >
              {status.type === 'success' 
                ? <Check size={18} className="mt-0.5 flex-shrink-0" strokeWidth={2} /> 
                : <AlertCircle size={18} className="mt-0.5 flex-shrink-0" strokeWidth={2} />
              }
              <span className="font-medium">{status.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="w-full py-3.5 px-4 bg-[var(--apple-blue)] hover:bg-[var(--apple-blue-hover)] text-white 
              rounded-xl font-semibold text-[15px] shadow-sm hover:shadow-lg transition-all duration-200 
              active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed 
              flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} strokeWidth={2} />
                <span>Save Configuration</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
