/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductItem({ product, addToCartHandler, fullVars }) {
  const fullVariants = fullVars ? fullVars : product.fullVariants;
  return (
    <div className="card bg-slate-50">
      <Link href={`/product/${product.slug}`}>
        <a>
          <div
            className="rounded shadow relative overflow-hidden"
            style={{ paddingTop: '75%' }}
          >
            <Image
              src={product.images[0].url}
              alt={product.images[0].altText}
              layout="fill"
              objectFit="cover"
              className="absolute top-0 left-0"
            />
          </div>
        </a>
      </Link>
      <div className="flex flex-col items-center justify-center p-5 bg-slate-100">
        <Link href={`/product/${product.slug}`}>
          <a>
            <h2 className="text-md">{product.name}</h2>
          </a>
        </Link>
        <p className="mb-1 text-sm">{product.brand}</p>
        <p className="text-red-700">
          {fullVariants && fullVariants.length > 0
            ? `$${fullVariants[0].price}`
            : `$${product.price}`}
        </p>
        {fullVariants && fullVariants.length > 0 ? (
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
