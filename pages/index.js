
import axios from 'axios';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import ProductItem from '../components/ProductItem';
import Product from '../models/Product';
import db from '../utils/db';
import { Store } from '../utils/Store';
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import Banner from '../models/Banner';

export default function Home({ products, banners }) {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;

  const addToCartHandler = async (product) => {
    const existItem = cart.cartItems.find((x) => x.slug === product.slug);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      toast.error('Sorry. Product is out of stock');
      return;
    }

    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });

    toast.success('Product added to the cart');
  };

  const liveBanners = banners.filter(function(banner) {
    return banner.live 
  })

  const sortedBanners = liveBanners.sort((a, b) => (a.order > b.order) ? 1 : -1)

  return (
    <Layout title="HerbGrinders">
      <Carousel showThumbs={false} autoPlay dynamicHeight>
        {sortedBanners.map((banner) => (
          <a href={banner.link} key={banner._id}>
            <div>           
              <img src={banner.image} alt={banner.alt}/>           
            </div>
          </a>
        ))}
      </Carousel>
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
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  const products = await Product.find().lean();
  const banners = await Banner.find().lean();
  return {
    props: {
      products: products.map(db.convertDocToObj),
      banners: banners.map(db.convertDocToObj),
    },
  };
}
