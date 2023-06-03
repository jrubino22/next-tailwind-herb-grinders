import axios from 'axios';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Layout from '../../components/Layout';
import ProductItem from '../../components/ProductItem';
import Category from '../../models/Category';
import Product from '../../models/Product';
import SubProduct from '../../models/SubProduct';
import db from '../../utils/db';
import { Store } from '../../utils/Store';

export default function CategoryPage({ category, products }) {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const addToCartHandler = async (product) => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      toast.error('Sorry. Product is out of stock');
      return;
    }

    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });

    toast.success('Product added to the cart');
  };

  return (
    <Layout
      title={category.title}
      metaDesc={category.metaDesc}
      applyMarginPadding={false}
    >
      {category.useBanner && (
        <div className="relative w-full h-96">
          <Image
            src={category.image.url}
            alt={category.image.altText}
            layout="fill"
            objectFit="cover"
            priority
          />

          <div
            className="absolute bottom-0 left-0 w-full p-5 text-white"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <h1 className="text-4xl ml-48 mb-2">{category.title}</h1>
          </div>
        </div>
      )}
      <div className="mt-8 px-4 md:px-8 lg:px-32 2xl:px-56">
        {!category.useBanner && (
          <h2 className="h2 my-4 font-bold text-xl ml-5">{category.title}</h2>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductItem
              product={product}
              addToCartHandler={addToCartHandler}
              key={product.slug}
            ></ProductItem>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  await db.connect();
  const category = await Category.findOne({ slug: params.slug }).lean();

  let products;
  if (category.isTags) {
    products = await Product.find({
      $or: [
        { tags: { $in: category.productTags } },
        { category: category._id },
      ],
    }).lean();
  } else {
    products = await Product.find({ category: category._id }).lean();
  }

  for (let i = 0; i < products.length; i++) {
    if (products[i].variants && products[i].variants.length > 0) {
      const productVariants = [];
      for (let j = 0; j < products[i].variants.length; j++) {
        const singleVariant = await SubProduct.findById(
          products[i].variants[j]
        ).lean();
        productVariants.push(singleVariant);
      }
      products[i].fullVariants = productVariants;
    } else {
      products[i].fullVariants = null;
    }
  }

  await db.disconnect();

  return {
    props: {
      category: db.convertDocToObj(category),
      products: JSON.parse(JSON.stringify(products.map(db.convertDocToObj))),
    },
  };
}
