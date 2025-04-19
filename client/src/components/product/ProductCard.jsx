// frontend/src/components/product/ProductCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatPrice, formatDiscount } from '../../utils/formatter';

const ProductCard = ({ product, onClick }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? 
      (typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].value) : 
      null
  );

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      ...product,
      selectedColor,
      quantity: 1
    });
  };

  const handleColorSelect = (e, color) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColor(color);
  };

  // Find primary image or use first image or placeholder
  const productImage = product.images && product.images.length > 0
    ? (product.images.find(img => img.isPrimary)?.imagePath || product.images[0].imagePath)
    : (product.image || '/images/product-placeholder.jpg');

  return (
    <div className="group relative" onClick={onClick}>
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden rounded-lg">
          {/* Product Image */}
          <div className="aspect-w-1 aspect-h-1 bg-neutral-100">
            <img
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Discount Badge */}
          {product.discountPercentage > 0 && (
            <div className="absolute top-2 right-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
              {product.discountPercentage}% OFF
            </div>
          )}

          {/* New Badge */}
          {product.isNew && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              NEW
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full shadow-sm hover:bg-opacity-100 transition-colors"
          >
            {isInWishlist(product.id) ? (
              <HeartIconSolid className="h-5 w-5 text-accent" />
            ) : (
              <HeartIcon className="h-5 w-5 text-neutral-500" />
            )}
          </button>

          {/* Quick Shop - Shows on hover on desktop */}
          <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2">
            <button
              onClick={handleAddToCart}
              className="w-full bg-neutral-900 text-white py-2 rounded hover:bg-neutral-800 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-3">
          <h3 className="text-sm font-medium text-neutral-900">{product.name}</h3>
          <p className="text-xs text-neutral-500 mb-1">{product.category}</p>
          
          {/* Price - Using the formatter utility */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-neutral-900">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-neutral-500 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {/* Discount - Using the formatter utility */}
          {product.originalPrice > product.price && (
            <p className="text-sm text-accent">
              {formatDiscount(product.originalPrice, product.price)}
            </p>
          )}

          {/* Color Options */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-2 flex space-x-1">
              {product.colors.slice(0, 4).map((color, index) => {
                const colorValue = typeof color === 'string' ? color : color.value;
                return (
                  <button
                    key={index}
                    style={{ backgroundColor: colorValue }}
                    className={`w-4 h-4 rounded-full border ${
                      selectedColor === colorValue ? 'ring-2 ring-neutral-900 ring-offset-1' : 'border-neutral-300'
                    }`}
                    onClick={(e) => handleColorSelect(e, colorValue)}
                    aria-label={`Select color ${typeof color === 'string' ? '' : color.name}`}
                  />
                );
              })}
              {product.colors.length > 4 && (
                <span className="text-xs text-neutral-500 self-center">+{product.colors.length - 4}</span>
              )}
            </div>
          )}

          {/* Return Policy */}
          <div className="mt-1 text-xs text-neutral-500">
            20 Days Easy Return
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;