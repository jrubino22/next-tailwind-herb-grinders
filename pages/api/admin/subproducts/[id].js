import Product from '../../../../models/Product';
import SubProduct from '../../../../models/SubProduct';
import db from '../../../../utils/db';
import { getSession } from 'next-auth/react';

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session || !session.user.isAdmin) {
    return res.status(401).send('admin signin required');
  }
  // const { user } = session;
  if (req.method === 'GET') {
    return getHandler(req, res);
  }
  if (req.method === 'POST') {
    return postHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const postHandler = async (req, res) => {
  console.log('pid', req.body.productId);
  await db.connect();

  const newProduct = new SubProduct({
    option: req.body.option,
    variant: req.body.variant,
    parentId: req.body.productId,
    image: 'none',
    sku: ' ',
    price: 0,
    countInStock: 0,
    weight: 0,
  });
  const subproduct = await newProduct.save();

  await Product.findOneAndUpdate(
    { _id: subproduct.parentId },
    { $push: { variants: subproduct._id } },
    { new: true, safe: true, upsert: true }
  ).then((result) => {
    return JSON.stringify({
      data: result,
    });
  });

  await db.disconnect();
  res.send({
    message: 'Variant created successfully',
    subproduct,
  });
};

const getHandler = async (req, res) => {
  console.log('pid', req.query.id);
  await db.connect();

  const product = await Product.findById(req.query.id);

  const productVariants = (await product.variants) ? [] : null;
  if (product.variants) {
    for (let i = 0; i < product.variants.length; i++) {
      const singleVariant = await SubProduct.findById(product.variants[i]);
      productVariants.push(singleVariant);
    }
    await db.disconnect();
    res.send(productVariants);
  }
};

export default handler;
