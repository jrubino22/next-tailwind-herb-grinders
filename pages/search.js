import axios from 'axios';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import ProductItem from '../components/ProductItem';
import Product from '../models/Product';
import db from '../utils/db';
import Pagination from '../components/Pagination';
import mongoose from 'mongoose';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const PAGE_SIZE = 30;

const prices = [
  {
    name: '$1 to $20',
    value: '1-20',
  },
  {
    name: '$20 to $50',
    value: '20.01-50',
  },
  {
    name: '$50 and up',
    value: '50.01-1000',
  },
];

// const ratings = [1, 2, 3, 4, 5];

export default function Search(props) {
  const router = useRouter();

  const {
    query = 'all',
    category = 'all',
    brand = 'all',
    price = 'all',
    rating = 'all',
    sort = 'newest',
  } = router.query;

  const { products, countProducts, categories, brands } = props;

  const filterSearch = ({
    page,
    category,
    brand,
    sort,
    min,
    max,
    searchQuery,
    price,
    rating,
  }) => {
    const { query } = router;
    if (page) query.page = page;
    if (searchQuery) query.searchQuery = searchQuery;
    if (sort) query.sort = sort;
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (price) query.price = price;
    if (rating) query.rating = rating;
    if (min) query.min ? query.min : query.min === 0 ? 0 : min;
    if (max) query.max ? query.max : query.max === 0 ? 0 : max;

    router.push({
      pathname: router.pathname,
      query: query,
    });
  };
  const categoryHandler = (e) => {
    filterSearch({ category: e.target.value });
  };
  // const pageHandler = (page) => {
  //   filterSearch({ page });
  // };
  const brandHandler = (e) => {
    filterSearch({ brand: e.target.value });
  };
  const sortHandler = (e) => {
    filterSearch({ sort: e.target.value });
  };
  const priceHandler = (e) => {
    filterSearch({ price: e.target.value });
  };
  // const ratingHandler = (e) => {
  //   filterSearch({ rating: e.target.value });
  // };

  const { state, dispatch } = useContext(Store);
  const addToCartHandler = async (product) => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      toast.error('Sorry. Product is out of stock');
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  };
  return (
    <Layout title="search">
      <div className="grid md:grid-cols-4 md:gap-5">
        <div>
          <div className="my-3">
            <h2>Categories</h2>
            <select
              className="w-full"
              value={category}
              onChange={categoryHandler}
            >
              <option value="all">All</option>
              {categories &&
                categories.map((category) => (
                  <option key={category.title} value={category._id}>
                    {category.title}
                  </option>
                ))}
            </select>
          </div>
          <div className="mb-3">
            <h2>Brands</h2>
            <select className="w-full" value={brand} onChange={brandHandler}>
              <option value="all">All</option>
              {brands &&
                brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
            </select>
          </div>
          <div className="mb-3">
            <h2>Price</h2>
            <select className="w-full" value={price} onChange={priceHandler}>
              <option value="all">All</option>
              {prices &&
                prices.map((price) => (
                  <option key={price.value} value={price.value}>
                    {price.name}
                  </option>
                ))}
            </select>
          </div>
          {/* <div className="mb-3">
            <h2>rating</h2>
            <select className="w-full" value={rating} onChange={ratingHandler}>
              <option value="all">All</option>
              {ratings &&
                ratings.map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
            </select>
          </div> */}
        </div>
        <div className="md:col-span-3">
          <div className="mb-2 flex items-center justify-between border-b-2 pb-2">
            <div className="flex items-center">
              {products.length === 0 ? 'No' : countProducts} Results
              {query !== 'all' && query !== '' && ' : ' + query}
              {category !== 'all' &&
                ` : ${categories.find((cat) => cat._id === category).title}`}
              {brand !== 'all' && ' : ' + brand}
              {price !== 'all' && ' : Price' + price}
              {rating !== 'all' && ' : Rating ' + rating + '& up'}
              &nbsp;
              {(query !== 'all' && query !== '') ||
              category !== 'all' ||
              brand !== 'all' ||
              rating !== 'all' ||
              price !== 'all' ? (
                <button onClick={() => router.push('/search')}>
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    className="w-6 h-6 text-currentColor"
                  />
                </button>
              ) : null}
            </div>
            <div>
              Sort by{' '}
              <select value={sort} onChange={sortHandler}>
                {/* <option value="featured">Featured</option> */}
                <option value="lowest">Price: Low to High</option>
                <option value="highest">Price: High to Low</option>
                {/* <option value="toprated">Customer Reviews</option> */}
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {products.map((product) => (
                <ProductItem
                  key={product._id}
                  product={product}
                  fullVars={product.variants}
                  addToCartHandler={addToCartHandler}
                />
              ))}
            </div>
            <Pagination
              postsPerPage={PAGE_SIZE}
              totalPosts={countProducts}
              paginate={(pageNumber) => {
                // Update the URL with the new page number
                router.push({
                  pathname: router.pathname,
                  query: { ...router.query, page: pageNumber },
                });
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ query }) {
  const pageSize = query.pageSize || PAGE_SIZE;
  const page = query.page || 1;
  const category = query.category || '';
  const brand = query.brand || '';
  const price = query.price || '';
  const rating = query.rating || '';
  const sort = query.sort || '';
  const searchQuery = query.query || '';

  const queryFilter =
    searchQuery && searchQuery !== 'all'
      ? {
          name: {
            $regex: searchQuery,
            $options: 'i',
          },
        }
      : {};

  const categoryFilter =
    category && category !== 'all'
      ? { category: mongoose.Types.ObjectId(category) }
      : {};

  const brandFilter = brand && brand !== 'all' ? { brand } : {};
  const ratingFilter =
    rating && rating !== 'all'
      ? {
          rating: {
            $gte: Number(rating),
          },
        }
      : {};

  const priceFilter =
    price && price !== 'all'
      ? {
              price: {
                $gte: Number(price.split('-')[0]),
                $lte: Number(price.split('-')[1]),
              },
        }
      : {};
  const order =
    sort === 'featured'
      ? { isFeatured: -1 }
      : sort === 'lowest'
      ? { price: 1 }
      : sort === 'highest'
      ? { price: -1 }
      : sort === 'toprated'
      ? { rating: -1 }
      : sort === 'newest'
      ? { createdAt: -1 }
      : { _id: -1 };

  await db.connect();

  // Updated logic to fetch categories
  const categories = await Product.aggregate([
    { $match: { category: { $ne: null } } },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryObj',
      },
    },
    { $unwind: '$categoryObj' },
    {
      $group: {
        _id: '$categoryObj._id',
        title: { $first: '$categoryObj.title' },
      },
    },
    {
      $project: {
        _id: { $toString: '$_id' },
        title: 1,
      },
    },
  ]);

  const brands = await Product.find().distinct('brand');

  const productDocs = await Product.aggregate([
    {
      $match: {
        ...queryFilter,
        ...categoryFilter,
        ...brandFilter,
        ...ratingFilter,
      },
    },
    {
      $addFields: {
        categoryStr: {
          $toString: '$category',
        },
        createdAtStr: {
          $toString: '$createdAt',
        },
        updatedAtStr: {
          $toString: '$updatedAt',
        },
        images: {
          $map: {
            input: '$images',
            as: 'image',
            in: {
              $mergeObjects: [
                '$$image',
                { idStr: { $toString: '$$image._id' } },
              ],
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'subproducts',
        localField: 'variants',
        foreignField: '_id',
        as: 'variants',
      },
    },
    {
      $addFields: {
        variants: {
          $map: {
            input: '$variants',
            as: 'variant',
            in: {
              $mergeObjects: [
                '$$variant',
                {
                  idStr: { $toString: '$$variant._id' },
                  parentIdStr: { $toString: '$$variant.parentId' },
                  _id: '$$REMOVE',
                  parentId: '$$REMOVE',
                  createdAt: '$$REMOVE',
                },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        minVariantPrice: {
          $cond: [
            {
              $gt: [{ $size: '$variants' }, 0],
            },
            {
              $min: [
                {
                  $reduce: {
                    input: '$variants',
                    initialValue: Infinity,
                    in: {
                      $min: [
                        '$$value',
                        {
                          $ifNull: ['$$this.price', Infinity],
                        },
                      ],
                    },
                  },
                },
              ],
            },
            { $ifNull: ['$price', Infinity] },
          ],
        },
      },
    },
    {
      $addFields: {
        price: {
          $cond: [
            { $eq: ['$minVariantPrice', Infinity] },
            '$price',
            '$minVariantPrice',
          ],
        },
      },
    },
    {
      $project: {
        category: 0,
        createdAt: 0,
        updatedAt: 0,
        description: 0,
        metaDesc: 0,
        features: 0,
        // price: '$minVariantPrice',
        'images._id': 0,
        'variants._id': 0,
        'variants.parentId': 0,
        'variants.createdAt': 0,
        'variants.updatedAt': 0,
      },
    },
    {
      $match: {
        ...priceFilter,
      },
    },
    { $sort: order },
    { $skip: pageSize * (page - 1) },
    { $limit: pageSize },
  ]);


  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...brandFilter,
    ...ratingFilter,
  });


  const totalPages = Math.ceil(countProducts / pageSize);

  await db.disconnect();

  const products = productDocs.map((product) => {
    const hasVariants = product.variants && product.variants.length > 0;

    product.images = product.images.map((image) => {
      return { ...image, _id: image.idStr };
    });

    product.variants = product.variants.map((variant) => {
      return { ...variant, _id: variant.idStr, parentId: variant.parentIdStr };
    });

    const productData = {
      ...product,
      _id: product._id.toString(),
      category: product.categoryStr,
      weight: hasVariants ? undefined : product.weight,
      countInStock: hasVariants ? undefined : product.countInStock,
      // price: product.minVariantPrice,
      sku: hasVariants ? undefined : product.sku,
    };

    return productData;
  });

  const currentPage = parseInt(page) || 1;

  const removeUndefinedProperties = (obj) => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
  };

  const cleanedProducts = products.map((product) =>
    removeUndefinedProperties(product)
  );

  return {
    props: {
      products: cleanedProducts,
      countProducts,
      categories,
      brands,
      currentPage,
      totalPages,
    },
  };
}
