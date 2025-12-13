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
        case 'receipt': return 'bg-emerald-600 hover:bg-emerald-700 ring-emerald-200';
        case 'issuance': return 'bg-amber-600 hover:bg-amber-700 ring-amber-200';
        case 'production': return 'bg-blue-600 hover:bg-blue-700 ring-blue-200';
        default: return 'bg-blue-600 hover:bg-blue-700 ring-blue-200';
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
            // Warn user if no endpoint is configured, but strictly speaking we might just log it 
            // or we could treat it as a success for the UI but warn about no upload.
            // For now, let's alert and stop to ensure they know it didn't go anywhere external.
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
                <p className="mt-2 text-gray-600">Please fill in the details below to record a new {type}.</p>
            </div>
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                title="Open Settings"
            >
                <Settings size={22} />
            </button>
        </div>

        <Header
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        <div className="space-y-4 mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                <span>Item Details</span>
                {isLoadingProducts && <span className="text-xs normal-case text-gray-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Loading products...</span>}
            </h2>
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

        <div className="flex justify-center mb-10">
            <button
            onClick={addProductSection}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium py-2 px-4 rounded-full hover:bg-blue-50 transition-colors border border-dashed border-blue-300 hover:border-blue-400 w-full justify-center"
            >
            <Plus size={18} />
            <span>Add Another Item</span>
            </button>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:p-0">
             <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all active:scale-[0.98] flex items-center justify-center gap-3 focus:ring-4 ${getThemeColor()} disabled:opacity-70 disabled:cursor-not-allowed`}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        Submit {title}
                        <Check size={20} strokeWidth={3} />
                    </>
                )}
            </button>
        </div>
        {/* Spacer for fixed bottom button on mobile */}
        <div className="h-24 sm:h-0"></div>
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onUpdateSuccess={fetchProducts}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 bg-green-50 border-b border-green-100 flex items-center gap-4">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <Check size={28} strokeWidth={3} />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-gray-900">Submission Successful</h3>
                   <p className="text-green-700">The following items have been recorded.</p>
                </div>
            </div>
            
            <div className="p-0 max-h-[60vh] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Product Name</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Quantity</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {submittedProducts.map((p, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 text-sm font-medium text-gray-900">{p.productName}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{p.quantity}</td>
                                <td className="py-3 px-4 text-sm text-gray-500 italic">{p.notes || "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button
                    onClick={() => setShowSuccessModal(false)}
                    className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors shadow-sm active:scale-95 flex items-center gap-2"
                >
                    <span>OK, Close</span>
                    <Check size={16} />
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryForm;
