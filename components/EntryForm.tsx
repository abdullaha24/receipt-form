import React, { useState } from 'react';
import Header from './Header';
import ProductSection from './ProductSection';
import { Plus, Check, Loader2 } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    // Simulate API call
    console.log("Submitting Form...", {
        type,
        user: selectedUser,
        date: format(selectedDate, 'dd-MM-yyyy'),
        items: products
    });

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    alert("Form submitted successfully! (Check console for data)");
    
    // Reset Form
    setSelectedUser("");
    setSelectedDate(new Date());
    setProducts([{ productName: "", quantity: "", notes: "" }]);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
            <p className="mt-2 text-gray-600">Please fill in the details below to record a new {type}.</p>
        </div>

        <Header
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />

        <div className="space-y-4 mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Item Details</h2>
            {products.map((product, index) => (
            <ProductSection
                key={index}
                index={index}
                data={product}
                updateData={updateProductData}
                removeSection={removeProductSection}
                isOnlySection={products.length === 1}
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
    </div>
  );
};

export default EntryForm;
