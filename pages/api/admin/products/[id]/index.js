import Product from '../../../../../models/Product';
import SubProduct from '../../../../../models/SubProduct';
import { getSession } from 'next-auth/react';
import db from '../../../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session || (session && !session.user.isAdmin)) {
    return res.status(401).send('signin required');
  }

  const { user } = session;
  if (req.method === 'GET') {
    return getHandler(req, res, user);
  } else if (req.method === 'PUT') {
    return putHandler(req, res, user);
  } else if (req.method === 'DELETE') {
    return deleteHandler(req, res, user);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const getHandler = async (req, res) => {
  await db.connect();

  const product = await Product.findById(req.query.id);

  await db.disconnect();

  res.json(product);
};

const putHandler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  if (product) {
    const originalName = product.name;
    const originalSlug = product.slug;
    const originalImages = [...product.images];
    product.name = req.body.name;
    product.slug = req.body.slug;
    product.price = req.body.price;
    product.category = req.body.category;
    product.brand = req.body.brand;
    product.countInStock = req.body.countInStock;
    product.description = req.body.prettyDescription;
    product.images = req.body.images;
    product.features = req.body.prettyFeatures;
    product.metaDesc = req.body.metaDesc;
    product.sku = req.body.sku;
    product.isActive = req.body.isActive;
    product.weight = req.body.productWeight;
    product.tags = req.body.productTags;

    const deletedImageUrls = [];

    for (const originalImage of originalImages) {
      const reqImage = req.body.images.find(
        (img) => img.url === originalImage.url
      );

      if (!reqImage) {
        deletedImageUrls.push(originalImage.url);
      }
    }

    const nonDeletedImage = req.body.images.length > 0 ? req.body.images[0] : { url: '' };

    for (const deletedImageUrl of deletedImageUrls) {
      await SubProduct.updateMany(
        { parentId: req.query.id, 'image.url': deletedImageUrl },
        { $set: { 'image.url': nonDeletedImage.url } }
      );
    }

    if (req.body.slug !== originalSlug) {
      await SubProduct.updateMany(
        { parentId: req.query.id },
        { $set: { slug: req.body.slug } }
      );
    }
    if (req.body.name !== originalName) {
      await SubProduct.updateMany(
        { parentId: req.query.id },
        { $set: { parentName: req.body.slug } }
      );
    }

    await product.save();
    await db.disconnect();

    res.send({ message: 'Product updated successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Product not found' });
  }
};

const deleteHandler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  if (product) {
    await SubProduct.deleteMany({ parentId: req.query.id });
    await product.remove();
    await db.disconnect();
    res.send({ message: 'Product deleted successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Product not found' });
  }
};
export default handler;
