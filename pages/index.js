import axios from 'axios';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import ProductItem from '../components/ProductItem';
import Product from '../models/Product';
import SubProduct from '../models/SubProduct';
import db from '../utils/db';
import { Store } from '../utils/Store';
// import { Carousel } from 'react-responsive-carousel';
// import 'react-responsive-carousel/lib/styles/carousel.min.css';
import HomeCarousel from '../components/HomeCarousel';
import Banner from '../models/Banner';
import IndexFeatured from '../models/IndexFeatured';
import IndexFeaturedComponent from '../components/IndexFeaturedComponent';

export default function Home({ products, banners, indexFeatured }) {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;

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

  const liveBanners = banners.filter(function (banner) {
    return banner.live;
  });

  const sortedBanners = liveBanners.sort((a, b) =>
    a.order > b.order ? 1 : -1
  );

  return (
    <Layout title="HerbGrinders" applyMarginPadding={false}>
      {console.log('ifd', indexFeatured)}
      <HomeCarousel banners={sortedBanners} />
      
      <div className="my-6 px-4 lg:px-40">
      <IndexFeaturedComponent images={indexFeatured} />
        <h2 className="h2 my-4 font-bold text-xl ml-5">New Grinders</h2>
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

export async function getServerSideProps() {
  await db.connect();
  const products = await Product.find({ isActive: true }).lean();
  const banners = await Banner.find().lean();
  const indexFeatured = await IndexFeatured.find().lean();

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

  return {
    props: {
      products: JSON.parse(JSON.stringify(products.map(db.convertDocToObj))),
      banners: banners.map(db.convertDocToObj),
      indexFeatured: indexFeatured.map(db.convertDocToObj),
    },
  };
}
