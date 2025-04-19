import { useState, useEffect } from 'react';
import { formatPrice } from '../../utils/formatter';
import { debounce } from '../../utils/helpers';
import { 
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const FilterSidebar = ({ 
  filters, 
  activeFilters, 
  onFilterChange, 
  onClearFilters, 
  isOpen, 
  onClose,
  availableColors = [],
  priceRange = [0, 2000],
  onPriceRangeChange
}) => {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);
  
  // Debounce price range changes
  const debouncedPriceChange = debounce((value) => {
    onPriceRangeChange(value);
  }, 500);
  
  // Update local price range when parent price range changes
  useEffect(() => {
    setLocalPriceRange(priceRange);
  }, [priceRange]);
  
  // Handle local price range change
  const handlePriceRangeChange = (e, index) => {
    const value = parseInt(e.target.value);
    const newRange = [...localPriceRange];
    newRange[index] = value;
    
    // Ensure min doesn't exceed max
    if (index === 0 && value > newRange[1]) {
      newRange[0] = newRange[1];
    }
    
    // Ensure max doesn't go below min
    if (index === 1 && value < newRange[0]) {
      newRange[1] = newRange[0];
    }
    
    setLocalPriceRange(newRange);
    debouncedPriceChange(newRange);
  };
  
  // Handle checkbox filter change
  const handleCheckboxChange = (category, value) => {
    const currentValues = activeFilters[category] || [];
    let newValues;
    
    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    onFilterChange(category, newValues);
  };
  
  // Handle radio button filter change
  const handleRadioChange = (category, value) => {
    onFilterChange(category, [value]);
  };
  
  // Handle color selection
  const handleColorSelect = (color) => {
    const currentColors = activeFilters.colors || [];
    let newColors;
    
    if (currentColors.includes(color.value)) {
      newColors = currentColors.filter(c => c !== color.value);
    } else {
      newColors = [...currentColors, color.value];
    }
    
    onFilterChange('colors', newColors);
  };

  // Mobile filter class
  const mobileFilterClass = isOpen
    ? 'fixed inset-0 z-40 flex'
    : 'hidden';

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 mr-8">
        <div className="bg-white rounded-lg shadow p-6 sticky top-24">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-medium text-neutral-900">Filters</h2>
            <button
              onClick={onClearFilters}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Clear all
            </button>
          </div>
          
          {/* Price range filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-neutral-900 mb-3">Price Range</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-500">{formatPrice(localPriceRange[0])}</span>
              <span className="text-sm text-neutral-500">{formatPrice(localPriceRange[1])}</span>
            </div>
            <div className="mt-4">
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={5000}
                  step={100}
                  value={localPriceRange[0]}
                  onChange={(e) => handlePriceRangeChange(e, 0)}
                  className="absolute z-10 w-full h-1 opacity-0 cursor-pointer"
                />
                <input
                  type="range"
                  min={0}
                  max={5000}
                  step={100}
                  value={localPriceRange[1]}
                  onChange={(e) => handlePriceRangeChange(e, 1)}
                  className="absolute z-20 w-full h-1 opacity-0 cursor-pointer"
                />
                
                {/* Range bar */}
                <div className="relative z-0 h-1 bg-neutral-200 rounded">
                  <div 
                    className="absolute h-1 bg-primary rounded"
                    style={{
                      left: `${(localPriceRange[0] / 5000) * 100}%`,
                      right: `${100 - (localPriceRange[1] / 5000) * 100}%`
                    }}
                  ></div>
                </div>
                
                {/* Range thumbs */}
                <div 
                  className="absolute z-30 w-4 h-4 bg-white border-2 border-primary rounded-full -mt-1.5"
                  style={{ left: `calc(${(localPriceRange[0] / 5000) * 100}% - 8px)` }}
                ></div>
                <div 
                  className="absolute z-30 w-4 h-4 bg-white border-2 border-primary rounded-full -mt-1.5"
                  style={{ left: `calc(${(localPriceRange[1] / 5000) * 100}% - 8px)` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Color filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-neutral-900 mb-3">Colors</h3>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((color) => (
                <button
                  key={color.value}
                  className={`w-8 h-8 rounded-full border ${
                    activeFilters.colors?.includes(color.value) 
                      ? 'ring-2 ring-primary ring-offset-1' 
                      : 'border-neutral-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleColorSelect(color)}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          
          {/* Other filter categories */}
          {filters.map((filter) => (
            <div key={filter.id} className="mb-6">
              <h3 className="text-sm font-medium text-neutral-900 mb-3">{filter.name}</h3>
              
              {filter.type === 'checkbox' && (
                <div className="space-y-2">
                  {filter.options.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={activeFilters[filter.id]?.includes(option.value) || false}
                        onChange={() => handleCheckboxChange(filter.id, option.value)}
                        className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                      />
                      <span className="ml-2 text-sm text-neutral-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {filter.type === 'radio' && (
                <div className="space-y-2">
                  {filter.options.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name={filter.id}
                        checked={activeFilters[filter.id]?.[0] === option.value}
                        onChange={() => handleRadioChange(filter.id, option.value)}
                        className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                      />
                      <span className="ml-2 text-sm text-neutral-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobile filter sidebar */}
      <div className={mobileFilterClass}>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-25" 
          onClick={onClose}
        ></div>
        
        {/* Slide-out panel */}
        <div className="relative w-4/5 max-w-xs bg-white h-full shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-medium text-neutral-900">Filters</h2>
            <button onClick={onClose}>
              <XMarkIcon className="h-6 w-6 text-neutral-500" />
            </button>
          </div>
          
          <div className="overflow-y-auto flex-1 p-4">
            {/* Price range filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-neutral-900 mb-3">Price Range</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-500">{formatPrice(localPriceRange[0])}</span>
                <span className="text-sm text-neutral-500">{formatPrice(localPriceRange[1])}</span>
              </div>
              <div className="mt-4">
                <div className="relative">
                  <input
                    type="range"
                    min={0}
                    max={5000}
                    step={100}
                    value={localPriceRange[0]}
                    onChange={(e) => handlePriceRangeChange(e, 0)}
                    className="absolute z-10 w-full h-1 opacity-0 cursor-pointer"
                  />
                  <input
                    type="range"
                    min={0}
                    max={5000}
                    step={100}
                    value={localPriceRange[1]}
                    onChange={(e) => handlePriceRangeChange(e, 1)}
                    className="absolute z-20 w-full h-1 opacity-0 cursor-pointer"
                  />
                  
                  {/* Range bar */}
                  <div className="relative z-0 h-1 bg-neutral-200 rounded">
                    <div 
                      className="absolute h-1 bg-primary rounded"
                      style={{
                        left: `${(localPriceRange[0] / 5000) * 100}%`,
                        right: `${100 - (localPriceRange[1] / 5000) * 100}%`
                      }}
                    ></div>
                  </div>
                  
                  {/* Range thumbs */}
                  <div 
                    className="absolute z-30 w-4 h-4 bg-white border-2 border-primary rounded-full -mt-1.5"
                    style={{ left: `calc(${(localPriceRange[0] / 5000) * 100}% - 8px)` }}
                  ></div>
                  <div 
                    className="absolute z-30 w-4 h-4 bg-white border-2 border-primary rounded-full -mt-1.5"
                    style={{ left: `calc(${(localPriceRange[1] / 5000) * 100}% - 8px)` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Color filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-neutral-900 mb-3">Colors</h3>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded-full border ${
                      activeFilters.colors?.includes(color.value) 
                        ? 'ring-2 ring-primary ring-offset-1' 
                        : 'border-neutral-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorSelect(color)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            
            {/* Other filter categories */}
            {filters.map((filter) => (
              <div key={filter.id} className="mb-6">
                <h3 className="text-sm font-medium text-neutral-900 mb-3">{filter.name}</h3>
                
                {filter.type === 'checkbox' && (
                  <div className="space-y-2">
                    {filter.options.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={activeFilters[filter.id]?.includes(option.value) || false}
                          onChange={() => handleCheckboxChange(filter.id, option.value)}
                          className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                        />
                        <span className="ml-2 text-sm text-neutral-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {filter.type === 'radio' && (
                  <div className="space-y-2">
                    {filter.options.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name={filter.id}
                          checked={activeFilters[filter.id]?.[0] === option.value}
                          onChange={() => handleRadioChange(filter.id, option.value)}
                          className="h-4 w-4 text-primary focus:ring-primary border-neutral-300"
                        />
                        <span className="ml-2 text-sm text-neutral-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="border-t p-4">
            <div className="flex space-x-3">
              <button
                onClick={onClearFilters}
                className="flex-1 py-2 px-4 border border-neutral-300 rounded text-neutral-700 bg-white hover:bg-neutral-50"
              >
                Clear all
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-transparent rounded text-white bg-primary hover:bg-primary-dark"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
