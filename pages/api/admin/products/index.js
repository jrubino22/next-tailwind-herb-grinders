import { getSession } from 'next-auth/react';
import Product from '../../../../models/Product';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session || !session.user.isAdmin) {
    return res.status(401).send('admin signin required');
  }
  //const { user } = session;
  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'POST') {
    return postHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const postHandler = async (req, res) => {
  await db.connect();
  const newProduct = new Product({
    name: 'sample name',
    slug: 'sample-name-' + Math.random(),
    images: [
      {
        url: 'https://res.cloudinary.com/ddsp9kgde/image/upload/v1677708544/placeholder_qqiwqi.png',
        altText:
          'placeholder image - this should be deleted once product images are added',
        displayOrder: 1,
      },
    ],
    price: 0,
    brand: 'sample brand',
    countInStock: 0,
    description: 'sample description',
    rating: 0,
    numReviews: 0,
  });

  const product = await newProduct.save();
  await db.disconnect();
  res.send({ message: 'Product created successfully', product });
};

const getHandler = async (req, res) => {
  await db.connect();
  const search = req.query.search || '';
  const filter = req.query.filter || '';
  const sort = req.query.sort || '';

  let filterQuery;
  if (filter === 'active') {
    filterQuery = { isActive: true };
  } else if (filter === 'inactive') {
    filterQuery = { isActive: false };
  } else {
    filterQuery = {};
  }

  let sortQuery;
  if (sort === 'newest') {
    sortQuery = { createdAt: -1 };
  } else if (sort === 'oldest') {
    sortQuery = { createdAt: 1 };
  } else {
    sortQuery = {};
  }

  const products = await Product.find({
    name: { $regex: search, $options: 'i' },
    ...filterQuery,
  }).sort(sortQuery);

  await db.disconnect();
  res.send(products);
};


export default handler;
