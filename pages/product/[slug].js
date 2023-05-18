import axios from 'axios';
// import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import Product from '../../models/Product';
import SubProduct from '../../models/SubProduct';
import db from '../../utils/db';
import { Store } from '../../utils/Store';
import Gallery from '../../components/Gallery';
// import MarkdownIt from 'markdown-it';
import { Disclosure } from '@headlessui/react';
import Reviews from '../../components/Reviews';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { decodeEntitiesPlugin } from '../../utils/utils';
import ReactStars from 'react-rating-stars-component';

export default function ProductScreen(props) {
  const { product } = props;
  const { subproducts } = props;
  const { state, dispatch } = useContext(Store);
  const router = useRouter();
  if (!product) {
    return (
      <Layout title="Product Not Found">
        <div>Product Not Found</div>
      </Layout>
    );
  }

  const components = {
    html: ({ node, ...props }) => {
      return <div dangerouslySetInnerHTML={{ __html: node.data }} {...props} />;
    },
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedOptions, setSelectedOptions] = useState(
    subproducts.length > 0
      ? product.options.reduce((options, option) => {
          return { ...options, [option.name]: option.values[0] };
        }, {})
      : {}
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const findMatchingSubProduct = useCallback(() => {
    if (subproducts.length === 0) {
      return null;
    }

    const matchingSubProduct = subproducts.find((subproduct) => {
      const selectedOptionsObj = subproduct.selectedOptions.reduce(
        (options, option) => {
          return { ...options, [option.name]: option.value };
        },
        {}
      );

      return Object.entries(selectedOptions).every(
        ([key, value]) => selectedOptionsObj[key] === value
      );
    });

    return matchingSubProduct || subproducts[0];
  }, [subproducts, selectedOptions]);

  const matchingSubProduct = findMatchingSubProduct();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedSubProduct, setSelectedSubProduct] = useState(
    matchingSubProduct ? matchingSubProduct._id : null
  );
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedSubProductStock, setSelectedSubProductStock] = useState(
    matchingSubProduct ? matchingSubProduct.countInStock : null
  );
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedSubProductPrice, setSelectedSubProductPrice] = useState(
    matchingSubProduct ? matchingSubProduct.price : null
  );
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedSubProductImage, setSelectedSubProductImage] = useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [quantityToAdd, setQuantityToAdd] = useState(1);

  const maxQuantity =
    subproducts.length > 0 && selectedSubProduct
      ? selectedSubProductStock
      : product.countInStock;

  // const handleOptionChange = (optionName, value) => {
  //   setSelectedOptions((prevSelectedOptions) => ({
  //     ...prevSelectedOptions,
  //     [optionName]: value,
  //   }));
  // };

  const changeOption = (optionName, optionValue) => {
    setSelectedOptions({ ...selectedOptions, [optionName]: optionValue });
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (subproducts.length > 0) {
      const updatedMatchingSubProduct = findMatchingSubProduct();
      setSelectedSubProduct(updatedMatchingSubProduct._id);
      setSelectedSubProductStock(updatedMatchingSubProduct.countInStock);
      setSelectedSubProductPrice(updatedMatchingSubProduct.price);
      setSelectedSubProductImage(updatedMatchingSubProduct.image);
    }
  }, [findMatchingSubProduct, selectedOptions, subproducts]);

  // const changeVariant = (id, price, image, stock) => {
  //   setSelectedSubProduct(id);
  //   setSelectedSubProductPrice(price);
  //   setSelectedSubProductImage(image);
  //   setSelectedSubProductStock(stock);
  //   setQuantityToAdd(1);
  // };

  const addVariantToCart = async () => {
    const existItem = state.cart.cartItems.find(
      (x) => x._id === selectedSubProduct
    );
    const quantity = existItem
      ? parseInt(existItem.quantity) + parseInt(quantityToAdd)
      : parseInt(quantityToAdd);
    const { data } = await axios.get(`/api/subproducts/${selectedSubProduct}`);

    if (data.countInStock < quantity) {
      return toast.error('Sorry. Product is out of stock');
    }

    dispatch({ type: 'CART_ADD_ITEM', payload: { ...data, quantity } });
    router.push('/cart');
  };

  const addToCartHandler = async () => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem
      ? parseInt(existItem.quantity) + parseInt(quantityToAdd)
      : parseInt(quantityToAdd);
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      return toast.error('Sorry. Product is out of stock');
    }

    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  };

  return (
    <Layout title={product.name} metaDesc={product.metaDesc}>
      <div className="py-2">
        <Link href="/">back to products</Link>
      </div>
      <div className="grid md:grid-cols-10 md:gap-5">
        <div className="col-span-2 md:col-span-4">
          <Gallery
            images={product.images}
            // variant={selectedVariant}
            // onVariantChange={handleVariantChange}
            selectedSubProductImage={selectedSubProductImage}
          />
        </div>
        <div className="col-span-2 lg:col-span-3">
          <ul>
            <div className="mb-5">
              <li>
                <h1 className="text-2xl mb-5">{product.name}</h1>
              </li>

              <li className="text-md mb-5 flex space-x-1">
                <h2>Brand:</h2> <span>{product.brand}</span>
              </li>
              <a href="#review-container">
                {product.numReviews > 0 ?
                <li className="text-lg">
                  <div className="flex items-left space-x-2">
                    <span className="color-pal-1">
                      {product.rating.toFixed(1)}
                    </span>
                    <ReactStars
                      isHalf={true}
                      size={24}
                      value={product.rating}
                      edit={false}
                      activeColor="#F99B1D"
                    />
                    <span className="color-pal-1">{`(${product.numReviews})`}</span>
                  </div>
                </li>
                :

                <li className="text-lg">
                  <div className="flex items-left space-x-2">
                    <span className="color-pal-1">
                      {product.rating.toFixed(1)}
                    </span>
                    <ReactStars
                      isHalf={true}
                      size={24}
                      value={product.rating}
                      edit={false}
                      activeColor="#F99B1D"
                    />
                    <span className="color-pal-1">No reviews yet</span>
                  </div>
                </li>
                
                }
              </a>
            </div>
            {product.options &&
              product.options.length > 0 &&
              product.options.map((option, index) => (
                <div key={index}>
                  <h3 className="font-bold">{option.name}</h3>
                  <select
                    value={selectedOptions[option.name] || ''}
                    onChange={(e) => changeOption(option.name, e.target.value)}
                  >
                    {option.values.map((value, idx) => (
                      <option key={idx} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            <hr></hr>
            <div className="my-5 hidden md:block">
              <ReactMarkdown
                components={components}
                rehypePlugins={[rehypeRaw, decodeEntitiesPlugin]}
              >
                {product.features}
              </ReactMarkdown>
            </div>
          </ul>
        </div>
        <div className="col-span-2">
          <div className="card p-5">
            <div className="mb-2 flex justify-between">
              <div className="text-lg">Price</div>
              <div className="text-lg text-blue">
                $
                {subproducts.length > 0
                  ? selectedSubProductPrice.toFixed(2)
                  : product.price.toFixed(2)}
              </div>
            </div>
            <div className="mb-4 flex justify-between">
              <div>Status</div>
              <div
                className={
                  subproducts.length > 0
                    ? selectedSubProductStock > 0
                      ? 'color-pal-1'
                      : 'text-red-500'
                    : product.countInStock > 0
                    ? 'color-pal-1'
                    : 'text-red-500'
                }
              >
                {subproducts.length > 0
                  ? selectedSubProductStock > 0
                    ? 'In stock'
                    : 'Out of stock'
                  : product.countInStock > 0
                  ? 'In stock'
                  : 'Out of stock'}
              </div>
            </div>
            <div className="mb-2 flex justify-between">
              <div className="flex items-center">Quantity</div>
              <div>
                <select
                  id="quantity-select"
                  className="w-full border rounded px-2 py-2 mb-4"
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(e.target.value)}
                >
                  {Array.from(
                    { length: maxQuantity },
                    (_, index) => index + 1
                  ).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              className="primary-button w-full"
              onClick={
                subproducts.length > 0 ? addVariantToCart : addToCartHandler
              }
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
      <div className="mt-1 grid md:grid-cols-10 md:gap-5">
        <div className="md:hidden">
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="mb-1 flex justify-between w-full px-4 py-2 text-lg font-semibold text-left  bg-white rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
                  <span>Product Features</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`${
                      open ? 'transform rotate-180' : ''
                    } w-5 h-5 text-white-500`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="px-4 pt-4 pb-2 text-gray-700">
                  <ReactMarkdown
                    components={components}
                    rehypePlugins={[rehypeRaw, decodeEntitiesPlugin]}
                  >
                    {product.features}
                  </ReactMarkdown>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-lg font-semibold text-left  bg-white rounded-lg hover:bg-gray-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
                  <span>Product Description</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`${
                      open ? 'transform rotate-180' : ''
                    } w-5 h-5 text-white-500`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="px-4 pt-4 pb-2 text-gray-700">
                  <ReactMarkdown
                    components={components}
                    rehypePlugins={[rehypeRaw, decodeEntitiesPlugin]}
                  >
                    {product.description}
                  </ReactMarkdown>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </div>
        {/* Product description on desktop */}
        <div className="hidden md:block md:col-start-2 md:col-span-8">
          <hr className="my-10 border-t border-gray-300" />
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-3">Product Description</h2>
            <ReactMarkdown
              components={components}
              rehypePlugins={[rehypeRaw, decodeEntitiesPlugin]}
            >
              {product.description}
            </ReactMarkdown>
          </div>
        </div>
        <div id="review-container" className="md:col-start-2 md:col-span-8">
          <Reviews productId={product._id} />
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  await db.connect();
  const products = await Product.find({}, { slug: 1 }).lean();
  await db.disconnect();

  const paths = products.map((product) => ({
    params: { slug: product.slug },
  }));

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { slug } = params;

  await db.connect();
  const product = await Product.findOne({ slug }).lean();

  // Check for product existence before trying to access its properties
  if (!product) {
    await db.disconnect();
    return {
      notFound: true,
      revalidate: 28800,
    };
  }

  let productVariants = [];
  if (product.variants) {
    for (let i = 0; i < product.variants.length; i++) {
      const singleVariant = await SubProduct.findById(product.variants[i]);
      productVariants.push(singleVariant);
    }
  }

  await db.disconnect();

  return {
    props: {
      product: JSON.parse(JSON.stringify(db.convertDocToObj(product))),
      subproducts: JSON.parse(JSON.stringify(productVariants)),
    },
    revalidate: 28800,
  };
}
