import { getSession } from 'next-auth/react';
import Category from '../../../../models/Category';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });

  if (!session || !session.user.isAdmin) {
    return res.status(401).send('admin signin required');
  }

  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'PUT') {
    return putHandler(req, res);
  } else if (req.method === 'DELETE') {
    return deleteHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const getHandler = async (req, res) => {
  const categoryId = req.query.id;
  await db.connect();
  const category = await Category.findById(categoryId);

  if (!category) {
    await db.disconnect();
    res.status(404).send('Category not found');
    return;
  }

  await db.disconnect();
  res.send(category);
};

const putHandler = async (req, res) => {
  const categoryId = req.query.id;
  await db.connect();
  const category = await Category.findById(categoryId);

  if (!category) {
    await db.disconnect();
    res.status(404).send('Category not found');
    return;
  }

  const { title, slug, description, metaDesc, altText, url, isTags, productTags, useCategoryImageBanner } = req.body;

  category.title = title;
  category.slug = slug;
  category.description = description;
  category.metaDesc = metaDesc;
  category.image.url = url;
  category.image.altText = altText;
  category.useBanner = useCategoryImageBanner;
  category.isTags = isTags;
  category.productTags = productTags;

  await category.save();
  await db.disconnect();

  res.send({ message: 'Category updated successfully', category });
};

const deleteHandler = async (req, res) => {
  const categoryId = req.query.id;
  await db.connect();
  const category = await Category.findById(categoryId);

  if (!category) {
    await db.disconnect();
    res.status(404).send('Category not found');
    return;
  }

  await category.remove();
  await db.disconnect();

  res.send({ message: 'Category deleted successfully' });
};

export default handler;