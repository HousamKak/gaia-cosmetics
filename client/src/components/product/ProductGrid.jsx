// frontend/src/components/product/ProductGrid.jsx
import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

/**
 * ProductGrid component for displaying products in a responsive grid layout
 * @param {Object} props - Component props
 * @param {Array} props.products - Array of product objects to display
 * @param {number} props.columns - Number of columns on desktop (default: 4)
 * @param {number} props.mobileColumns - Number of columns on mobile (default: 2)
 * @param {string} props.gap - Gap between grid items (default: '4')
 * @param {boolean} props.loading - Loading state
 * @param {string} props.emptyMessage - Message to display when no products
 * @param {Function} props.onProductClick - Function to call when a product is clicked
 * @returns {JSX.Element} Rendered component
 */
const ProductGrid = ({ 
  products = [], 
  columns = 4, 
  mobileColumns = 2, 
  gap = '4',
  loading = false,
  emptyMessage = 'No products found',
  onProductClick
}) => {
  // Determine column classes based on props
  const getColumnClasses = () => {
    let colClasses = `grid-cols-${mobileColumns}`;
    
    if (columns === 3) {
      colClasses += ` md:grid-cols-3`;
    } else if (columns === 4) {
      colClasses += ` md:grid-cols-3 lg:grid-cols-4`;
    } else if (columns === 2) {
      colClasses += ` md:grid-cols-2`;
    } else if (columns === 5) {
      colClasses += ` md:grid-cols-3 lg:grid-cols-5`;
    }
    
    return colClasses;
  };

  // If loading, display skeleton loading state
  if (loading) {
    return (
      <div className={`grid ${getColumnClasses()} gap-${gap}`}>
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-neutral-200 aspect-w-1 aspect-h-1 rounded-lg mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // If no products, display empty message
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  // Render the product grid
  return (
    <div className={`grid ${getColumnClasses()} gap-${gap}`}>
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onClick={() => onProductClick && onProductClick(product)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;