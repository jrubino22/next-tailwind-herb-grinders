import { getSession } from 'next-auth/react';
import Category from '../../../../models/Category';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session || !session.user.isAdmin) {
    return res.status(401).send('admin signin required');
  }
  if (req.method === 'POST') {
    return postHandler(req, res);
  } else if (req.method === 'GET') {
    return getHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const postHandler = async (req, res) => {
  await db.connect();
  const newCategory = new Category({
    title: 'New Category',
    slug: 'new-category',
    description: 'Short but engaging description',
    metaDesc: 'SEO friendly description around 150-160 chars',
    isTags: false,
    productTags: [],
    image: {
      url: '',
      altText: 'SEO friendly image description',
    },
  });

  const category = await newCategory.save();
  await db.disconnect();
  res.send({ message: 'Category created successfully', category });
};

const getHandler = async (req, res) => {
  db.connect();
  const categories = await Category.find({});
  await db.disconnect();
  res.send(categories);
};

export default handler;