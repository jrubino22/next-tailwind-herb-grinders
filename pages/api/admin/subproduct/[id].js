import SubProduct from '../../../../models/SubProduct';
import Product from '../../../../models/Product';
import { getSession } from 'next-auth/react';
import db from '../../../../utils/db';

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

  const subproduct = await SubProduct.findById(req.query.id);

  await db.disconnect();

  res.json(subproduct);
};

const putHandler = async (req, res) => {
  await db.connect();
  const subproduct = await SubProduct.findById(req.query.id);
  if (subproduct) {
    subproduct.option = req.body.option;
    subproduct.variant = req.body.variant;
    subproduct.sku = req.body.sku;
    subproduct.image.url = req.body.image.url;
    subproduct.image.altText = req.body.image.altText;
    subproduct.price = req.body.price;
    subproduct.countInStock = req.body.countInStock;
    subproduct.weight = req.body.weight;
    await subproduct.save();
    await db.disconnect();
    res.send({ message: 'variant updated successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'variant not found' });
  }
};

const deleteHandler = async (req, res) => {
  await db.connect();
  const subproduct = await SubProduct.findById(req.query.id);
  if (subproduct) {
    const product = await Product.findById(subproduct.parentId);
    if (product) {
      console.log(product, 'product');
      await Product.updateOne(
        { _id: product._id },
        { $pull: { variants: subproduct._id } }
      );
    }
    await subproduct.remove();
    await db.disconnect();
    res.send({ message: 'variant deleted successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'variant not found' });
  }
};

export default handler;
