
import { getSession } from 'next-auth/react';
import SubProduct from '../../../../models/SubProduct';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session || !session.user.isAdmin) {
    return res.status(401).send('admin signin required');
  }
  //const { user } = session;
//   if (req.method === 'GET') {
//     return getHandler(req, res);
//   } else 
  if (req.method === 'POST') {
    return postHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const postHandler = async (req, res) => {
    console.log("pid", req.body.productId)
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

  const product = await newProduct.save();
  await db.disconnect();
  res.send({ message: 'Variant created successfully', product });
};

// const getHandler = async (req, res) => {
//   await db.connect();
//   const products = await SubProduct.find({parentId: Query.productId});
//   await db.disconnect();
//   res.send(products);
// };

export default handler;
