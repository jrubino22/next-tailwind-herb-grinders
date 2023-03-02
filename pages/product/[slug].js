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
    subproducts[0]._id
  );
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [selectedSubProductPrice, setSelectedSubProductPrice] = useState(subproducts[0].price)

  const changeVariant = (id, price) => {
    setSelectedSubProduct(id)
    setSelectedSubProductPrice(price)
  }

  const addVariantToCart = async () => {
    const existItem = state.cart.cartItems.find(
      (x) => x._id === subproducts._id
    );
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${subproducts._id}`);

    if (data.countInStock < quantity) {
      return toast.error('Sorry. Product is out of stock');
    }

    dispatch({ type: 'CART_ADD_ITEM', payload: { ...subproducts, quantity } });
    router.push('/cart');
  };

  const addToCartHandler = async () => {
    const existItem = state.cart.cartItems.find((x) => x.slug === product.slug);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      return toast.error('Sorry. Product is out of stock');
    }

    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  };

  return (
    <Layout title={product.name}>
      <div className="py-2">
        <Link href="/">back to products</Link>
      </div>
      <div className="grid md:grid-cols-4 md:gap-5">
        <div className="md:col-span-2">
          <Gallery
            images={product.images}
            // variant={selectedVariant}
            // onVariantChange={handleVariantChange}
          />
        
        </div>
        <div>
          <ul>
            <div className="mb-5">
              <li>
                <h1 className="text-xl">{product.name}</h1>
              </li>
              <li className="text-lg">Category: {product.category}</li>
              <li className="text-lg">Brand: {product.brand}</li>
              <li className="text-lg">
                {product.rating} of {product.numReviews} reviews
              </li>
            </div>
            {subproducts && (
              <>
                <hr></hr>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 my-5">
                  {subproducts.map((subproduct) => (
                    <div
                      className="text-center col-span-1 mr-2"
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
                          onChange={() => changeVariant(subproduct._id, subproduct.price)}
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
            <div className="my-5">
              <li className="text-lg">{product.description}</li>
            </div>
          </ul>
        </div>
        <div>
          <div className="card p-5">
            <div className="mb-2 flex justify-between">
              <div className="text-lg">Price</div>
              <div className="text-lg text-blue">${subproducts ? selectedSubProductPrice : product.price}</div>
            </div>
            <div className="mb-2 flex justify-between">
              <div>Status</div>
              <div>
                {product.countInStock > 0 ? 'In stock' : 'Out of stock'}
              </div>
            </div>
            <button
              className="primary-button w-full"
              onClick={subproducts ? addVariantToCart : addToCartHandler}
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
