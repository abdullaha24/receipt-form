import React, { useState, useEffect } from 'react';
import Header from './Header';
import ProductSection from './ProductSection';
import SettingsModal from './SettingsModal';
import { Plus, Check, Loader2, Settings } from 'lucide-react';
import { format } from 'date-fns';

interface EntryFormProps {
  title: string;
  type: 'receipt' | 'issuance' | 'production';
}

interface ProductData {
  productName: string;
  quantity: string;
  notes: string;
}

const EntryForm: React.FC<EntryFormProps> = ({ title, type }) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [products, setProducts] = useState<ProductData[]>([
    { productName: "", quantity: "", notes: "" }
  ]);
  const [availableProducts, setAvailableProducts] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedProducts, setSubmittedProducts] = useState<ProductData[]>([]);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
        const res = await fetch(`/api/products?type=${type}`);
        if(res.ok) {
            const data = await res.json();
            setAvailableProducts(data || []);
        }
    } catch (error) {
        console.error("Failed to fetch products", error);
    } finally {
        setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [type]);

  const updateProductData = (index: number, field: keyof ProductData, value: string) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };

  const addProductSection = () => {
    setProducts([...products, { productName: "", quantity: "", notes: "" }]);
  };

    const removeProductSection = (index: number) => {
        if (products.length > 1) {
            const newProducts = products.filter((_, i) => i !== index);
            setProducts(newProducts);
        }
    };

  const getThemeColor = () => {
    switch (type) {
        // Using refined Apple-style colors
        case 'receipt': return 'bg-[#34c759] hover:bg-[#2db14e] shadow-lg shadow-green-500/30';
        case 'issuance': return 'bg-[#ff9f0a] hover:bg-[#e38d09] shadow-lg shadow-orange-500/30';
        case 'production': return 'bg-[#0071e3] hover:bg-[#0077ed] shadow-lg shadow-blue-500/30';
        default: return 'bg-[#0071e3] hover:bg-[#0077ed] shadow-lg shadow-blue-500/30';
    }
  };

  const getThemeTextColor = () => {
     switch (type) {
        case 'receipt': return 'text-[#34c759]';
        case 'issuance': return 'text-[#ff9f0a]';
        case 'production': return 'text-[#0071e3]';
        default: return 'text-[#0071e3]';
    }
  };

  const handleSubmit = async () => {
    // Basic Validation
    if (!selectedUser) {
        alert("Please select a User.");
        return;
    }
    if (!selectedDate) {
        alert("Please select a Date.");
        return;
    }
    
    for (let i = 0; i < products.length; i++) {
        if (!products[i].productName) {
            alert(`Please select a Product for Item ${i + 1}.`);
            return;
        }
        if (!products[i].quantity) {
             alert(`Please enter a Quantity for Item ${i + 1}.`);
             return;
        }
    }

    setIsSubmitting(true);
    
    // Construct Payload
    const payload = {
        header: {
            formType: type,
            user: selectedUser,
            date: format(selectedDate, 'dd-MM-yyyy'),
            submissionTimestamp: new Date().toISOString()
        },
        body: {
            products: products
        }
    };

    console.log("Form Submission Payload:", JSON.stringify(payload, null, 2));

    try {
        // 1. Get the configured endpoint
        const settingsRes = await fetch('/api/settings');
        if (!settingsRes.ok) {
            throw new Error("Failed to retrieve API configuration");
        }
        const settings = await settingsRes.json();
        
        if (!settings.endpoint) {
            // Warn user if no endpoint is configured
            alert("No API endpoint configured! Please set one in the Home screen settings.");
            setIsSubmitting(false);
            return;
        }

        // 2. Send data to the endpoint
        const uploadRes = await fetch(settings.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!uploadRes.ok) {
             throw new Error(`External API Error: ${uploadRes.status} ${uploadRes.statusText}`);
        }

        // Success
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
        
        setSubmittedProducts(products);
        setShowSuccessModal(true);

        
        // Reset Form
        setSelectedUser("");
        setSelectedDate(new Date());
        setProducts([{ productName: "", quantity: "", notes: "" }]);

    } catch (error: any) {
        console.error("Submission Error:", error);
        alert(`Submission Failed: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--apple-bg)] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 flex justify-between items-center">
            <div>
                <h1 className="text-4xl font-semibold text-[#1d1d1f] tracking-tight truncate capitalize">{title}</h1>
                <p className="mt-3 text-lg text-[#86868b] font-normal">Record a new {type} entry.</p>
            </div>
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-3 text-gray-400 hover:text-[#1d1d1f] bg-white rounded-full shadow-sm hover:shadow-md transition-all border border-transparent hover:border-gray-100"
                title="Open Settings"
            >
                <Settings size={24} />
            </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-black/5 overflow-hidden">
             
            <div className="p-8">
                 <Header
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                 />

                <div className="space-y-6 mb-10">
                    <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                         <h2 className="text-sm font-semibold text-[#86868b] uppercase tracking-wider">Items</h2>
                         {isLoadingProducts && <span className="text-xs text-[#86868b] flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Syncing...</span>}
                    </div>
                   
                    {products.map((product, index) => (
                    <ProductSection
                        key={index}
                        index={index}
                        data={product}
                        updateData={updateProductData}
                        removeSection={removeProductSection}
                        isOnlySection={products.length === 1}
                        availableProducts={availableProducts}
                    />
                    ))}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={addProductSection}
                        className={`group flex items-center gap-2 ${getThemeTextColor()} bg-gray-50 hover:bg-gray-100 font-medium py-3 px-6 rounded-full transition-all active:scale-95`}
                    >
                        <div className="bg-white rounded-full p-1 shadow-sm group-hover:shadow group-active:scale-90 transition-all">
                             <Plus size={16} />
                        </div>
                        <span>Add Another Item</span>
                    </button>
                </div>
            </div>

            <div className="bg-gray-50/50 p-6 sm:px-8 border-t border-gray-100 flex justify-end sticky bottom-0 z-10 backdrop-blur-xl sm:static sm:backdrop-blur-none transition-all">
                 <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full sm:w-auto py-4 px-10 rounded-2xl text-white font-semibold text-lg hover:shadow-xl transform transition-all active:scale-[0.98] flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-opacity-20 disabled:opacity-70 disabled:cursor-not-allowed ${getThemeColor()}`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            Submit Order
                            <Check size={20} strokeWidth={2.5} />
                        </>
                    )}
                </button>
            </div>
            
        </div>
        
        {/* Spacer for mobile */}
        <div className="h-24 sm:h-0"></div>
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onUpdateSuccess={fetchProducts}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-8 bg-[#f5f5f7] border-b border-gray-200 flex items-center gap-5">
                <div className="bg-[#34c759] p-3 rounded-full text-white shadow-lg shadow-green-500/30">
                    <Check size={32} strokeWidth={3} />
                </div>
                <div>
                   <h3 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">Success</h3>
                   <p className="text-[#86868b]">Your entry has been recorded.</p>
                </div>
            </div>
            
            <div className="p-0 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white sticky top-0 z-10 box-shadow-sm">
                        <tr>
                            <th className="py-4 px-6 text-xs font-semibold text-[#86868b] uppercase tracking-wider border-b border-gray-100">Product</th>
                            <th className="py-4 px-6 text-xs font-semibold text-[#86868b] uppercase tracking-wider border-b border-gray-100">Qty</th>
                            <th className="py-4 px-6 text-xs font-semibold text-[#86868b] uppercase tracking-wider border-b border-gray-100">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {submittedProducts.map((p, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-6 text-base font-medium text-[#1d1d1f]">{p.productName}</td>
                                <td className="py-4 px-6 text-base text-[#1d1d1f]">{p.quantity}</td>
                                <td className="py-4 px-6 text-sm text-[#86868b] italic">{p.notes || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button
                    onClick={() => setShowSuccessModal(false)}
                    className="px-8 py-3 bg-[#1d1d1f] hover:bg-black text-white font-medium rounded-full transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                    <span>Done</span>
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryForm;
