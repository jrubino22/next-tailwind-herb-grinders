/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactStars from 'react-rating-stars-component';

export default function ProductItem({ product, fullVars }) {
  const fullVariants = fullVars ? fullVars : product.fullVariants;
  return (
    <div className="card bg-slate-100">
      <div className="bg-slate-50">
        <Link href={`/product/${product.slug}`}>
          <a aria-label={product.name}>
            <div className="rounded shadow relative overflow-hidden">
              <Image
                src={product.images[0].url}
                alt={product.images[0].altText}
                layout="responsive"
                className="mx-auto max-w-full h-auto absolute inset-0 object-cover"
                height="1280"
                width="1280"
              />
            </div>
          </a>
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center p-5 bg-slate-100">
        <Link href={`/product/${product.slug}`}>
          <a aria-label={product.name}>
            <h2 className="text-md mb-2">{product.name}</h2>
          </a>
        </Link>
        <p className="mb-2 text-sm">{product.brand}</p>
        {product.numReviews > 0 && (
          <div className="flex items-center">
            <ReactStars
              isHalf={true}
              size={20}
              value={product.rating}
              edit={false}
              activeColor="#F99B1D"
            />
            <span>{`(${product.numReviews})`}</span>
          </div>
        )}
        <p className="text-md subhead-text text-red-700">
          {fullVariants && fullVariants.length > 0
            ? `$${fullVariants[0].price.toFixed(2)}`
            : `$${product.price}`}
        </p>
        {/* {fullVariants && fullVariants.length > 0 ? (
          <Link href={`product/${product.slug}`}>
            <a type="button" className="primary-button view-options-btn">
              View Options
            </a>
          </Link>
        ) : (
          <button
            className="primary-button"
            type="button"
            onClick={() => addToCartHandler(product)}
          >
            Add to cart
          </button>
        )} */}
      </div>
    </div>
  );
}
