/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';

export default function ProductItem({ product, addToCartHandler, fullVars }) {
  console.log('fv', fullVars)
  const fullVariants = fullVars ? fullVars : product.fullVariants
  return (
    <div className="card bg-white">
      <Link href={`/product/${product.slug}`}>
        <a>
          <img
            src={product.images[0].url}
            alt={product.images[0].altText}
            className="rounded shadow"
          />
        </a>
      </Link>
      <div className="flex flex-col items-center justify-center p-5 ">
        <Link href={`/product/${product.slug}`}>
          <a>
            <h2 className="text-lg">{product.name}</h2>
          </a>
        </Link>
        <p className="mb-2">{product.brand}</p>
        <p>
          {(fullVariants && fullVariants.length > 0)
            ? `from $${fullVariants[0].price}`
            : `$${product.price}`}
        </p>
        {(fullVariants && fullVariants.length > 0) ? (
          <a
            type="button"
            href={`product/${product.slug}`}
            className="primary-button view-options-btn"
          >
            View Options
          </a>
        ) : (
          <button
            className="primary-button"
            type="button"
            onClick={() => addToCartHandler(product)}
          >
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
}
