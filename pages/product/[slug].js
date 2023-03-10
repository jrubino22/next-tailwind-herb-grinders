import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import Product from '../../models/Product';
import SubProduct from '../../models/SubProduct';
import db from '../../utils/db';
import { Store } from '../../utils/Store';
import Gallery from '../../components/Gallery';
import MarkdownIt from 'markdown-it';

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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedSubProduct, setSelectedSubProduct] = useState(
    subproducts.length > 0 ? subproducts[0]._id : null
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedSubProductStock, setSelectedSubProductStock] = useState(
    subproducts.length > 0 ? subproducts[0].countInStock : null
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedSubProductPrice, setSelectedSubProductPrice] = useState(
    subproducts.length > 0 ? subproducts[0].price : null
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedSubProductImage, setSelectedSubProductImage] = useState(null);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [quantityToAdd, setQuantityToAdd] = useState(1);

  const maxQuantity =
    subproducts.length > 0 && selectedSubProduct
      ? selectedSubProductStock
      : product.countInStock;

  const changeVariant = (id, price, image, stock) => {
    setSelectedSubProduct(id);
    setSelectedSubProductPrice(price);
    setSelectedSubProductImage(image);
    setSelectedSubProductStock(stock);
    setQuantityToAdd(1);
  };

  const addVariantToCart = async () => {
    const existItem = state.cart.cartItems.find(
      (x) => x._id === selectedSubProduct
    );
    const quantity = existItem
      ? parseInt(existItem.quantity) + parseInt(quantityToAdd)
      : parseInt(quantityToAdd);
    const { data } = await axios.get(`/api/subproducts/${selectedSubProduct}`);

    console.log('variant cart', data, quantity, quantityToAdd);

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

  const md = new MarkdownIt();

  const html = md.render(product.description);

  return (
    <Layout title={product.name}>
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
                <h1 className="text-2xl font-bold mb-5">{product.name}</h1>
              </li>

              <li className="text-md">
                <span className="font-bold">Brand:</span> {product.brand}
              </li>
            </div>
            {subproducts.length > 0 && (
              <>
                <hr></hr>
                <div className="variants-container grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 my-5">
                  {subproducts.map((subproduct) => (
                    <div
                      className="text-center variant-wrapper col-span-1 mr-2"
                      key={subproduct._id}
                    >
                      <div className="variant-info">
                        <p className="content-center variant-price">
                          ${subproduct.price}
                        </p>
                        <p className="content-center">{subproduct.variant}</p>
                      </div>
                      <label>
                        <input
                          type="radio"
                          value={subproduct._id}
                          onChange={() =>
                            changeVariant(
                              subproduct._id,
                              subproduct.price,
                              subproduct.image.url,
                              subproduct.countInStock
                            )
                          }
                          className="variant-select absolute opacity-0 h-0 w-0 peer"
                          name="colors"
                          checked={
                            subproduct._id === selectedSubProduct ? true : false
                          }
                        />
                        <div className="variant-image peer-checked:shadow-[0_0_0_3px_rgb(252,211,77)]">
                          <Image
                            alt={subproduct.image.altText}
                            src={subproduct.image.url}
                            width={640}
                            height={640}
                            layout="responsive"
                          />
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </>
            )}
            <hr></hr>
            <div className="my-5 description-prod">
              <div
                className="my-5"
                dangerouslySetInnerHTML={{ __html: html }}
              ></div>
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
                  ? selectedSubProductPrice
                  : product.price}
              </div>
            </div>
            <div className="mb-4 flex justify-between">
              <div>Status</div>
              <div
                className={
                  subproducts.length > 0
                    ? selectedSubProductStock > 0
                      ? 'text-green-600'
                      : 'text-red-500'
                    : product.countInStock > 0
                    ? 'text-green-600'
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
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;

  await db.connect();
  const product = await Product.findOne({ slug }).lean();

  const productVariants = (await product.variants) ? [] : null;
  if (product.variants) {
    for (let i = 0; i < product.variants.length; i++) {
      const singleVariant = await SubProduct.findById(product.variants[i]);
      productVariants.push(singleVariant);
    }
  }

  await db.disconnect();
  return {
    props: {
      product: product
        ? JSON.parse(JSON.stringify(db.convertDocToObj(product)))
        : null,
      subproducts: JSON.parse(JSON.stringify(productVariants)),
    },
  };
}
