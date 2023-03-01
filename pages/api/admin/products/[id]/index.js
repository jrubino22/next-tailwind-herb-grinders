import Product from '../../../../../models/Product';
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

// const getHandler2 = async (req, res) => {

// }

// const putHandler = async (req, res) => {
//   await db.connect();
//   const product = await Product.findById(req.query.id);
//   if (product) {
//     product.name = req.body.name;
//     product.slug = req.body.slug;
//     product.price = req.body.price;
//     product.category = req.body.category;
//     product.images = req.body.images;
//     product.brand = req.body.brand;
//     product.countInStock = req.body.countInStock;
//     product.description = req.body.description;
//     await product.save();
//     await db.disconnect();
//     res.send({ message: 'Product updated successfully' });
//   } else {
//     await db.disconnect();
//     res.status(404).send({ message: 'Product not found' });
//   }
// };

const putHandler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  if (product) {
    product.name = req.body.name;
    product.slug = req.body.slug;
    product.price = req.body.price;
    product.category = req.body.category;
    product.brand = req.body.brand;
    product.countInStock = req.body.countInStock;
    product.description = req.body.description;
    product.images = req.body.images;


    // Iterate over the images in the database and check if each image exists in the request body
    for (let i = 0; i < product.images.length; i++) {
      const dbImage = product.images[i];
      const reqImage = req.body.images.find((img) => img.url === dbImage.url);

      // If the image does not exist in the request body, remove it from the database
      if (!reqImage) {
        await Product.updateOne(
          { _id: product._id },
          { $pull: { images: { url: dbImage.url } } }
        );
      }
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
    await product.remove();
    await db.disconnect();
    res.send({ message: 'Product deleted successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Product not found' });
  }
};
export default handler;
