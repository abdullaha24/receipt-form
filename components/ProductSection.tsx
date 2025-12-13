import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Trash2 } from 'lucide-react';

interface ProductData {
  productName: string;
  quantity: string;
  notes: string;
}

interface ProductSectionProps {
  index: number;
  data: ProductData;
  updateData: (index: number, field: keyof ProductData, value: string) => void;
  removeSection: (index: number) => void;
  isOnlySection: boolean;
  availableProducts: string[]; // [NEW] Accept dynamic list
}

const ProductSection: React.FC<ProductSectionProps> = ({ index, data, updateData, removeSection, isOnlySection, availableProducts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // [MODIFIED] Use the prop instead of constant
  const filteredProducts = availableProducts.filter(product =>
    product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProduct = (product: string) => {
    updateData(index, 'productName', product);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleQuantityChange = (value: string) => {
    // Regex allows empty string, or positive/negative integers/decimals
    const isNumeric = /^-?\d*\.?\d*$/.test(value);
    
    if (isNumeric) {
      setShowWarning(false);
      updateData(index, 'quantity', value);
    } else {
      setShowWarning(true);
      updateData(index, 'quantity', value);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-4 relative transition-all hover:shadow-md">
       <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Item {index + 1}</h3>
        {!isOnlySection && (
            <button 
                onClick={() => removeSection(index)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                title="Remove item"
            >
                <Trash2 size={18} />
            </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Product Name (Searchable Dropdown) */}
        <div className="space-y-2" ref={wrapperRef}>
          <label className="block text-sm font-medium text-gray-700">
            Product Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div
              className={`w-full p-3 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center cursor-pointer hover:border-blue-400 transition-colors ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className={data.productName ? 'text-gray-900' : 'text-gray-400'}>
                {data.productName || "Select Product"}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </div>

            {isOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                <div className="p-2 sticky top-0 bg-white border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()} 
                    />
                  </div>
                </div>
                {availableProducts.length === 0 ? (
                     <div className="px-4 py-3 text-sm text-amber-600 bg-amber-50 text-center">
                        List is empty. Upload products in Settings.
                     </div>
                ) : filteredProducts.length > 0 ? (
                  <ul>
                    {filteredProducts.map((product, idx) => (
                      <li
                        key={`${product}-${idx}`}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 flex items-center justify-between ${data.productName === product ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                        onClick={() => handleSelectProduct(product)}
                      >
                        {product}
                      </li>
                    ))}
                  </ul>
                ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">No products found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quantity */}
        <div className="space-y-2 relative">
          <label className="block text-sm font-medium text-gray-700">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            placeholder="Enter quantity"
            className={`w-full p-3 bg-gray-50 border rounded-lg transition-all outline-none ${showWarning ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`}
          />
          {showWarning && (
            <div className="absolute z-10 left-0 -bottom-10 bg-red-600 text-white text-xs px-3 py-2 rounded shadow-lg after:content-[''] after:absolute after:left-4 after:-top-1 after:w-2 after:h-2 after:bg-red-600 after:rotate-45">
               Only numbers allowed. Please enter a number.
            </div>
          )}
        </div>

        {/* Notes (Optional) */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Notes <span className="text-gray-400 text-xs font-normal">(Optional)</span>
          </label>
          <textarea
            value={data.notes}
            onChange={(e) => updateData(index, 'notes', e.target.value)}
            placeholder="Add any additional details..."
            rows={3}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductSection;
