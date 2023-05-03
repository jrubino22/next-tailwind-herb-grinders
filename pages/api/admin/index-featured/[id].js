import IndexFeatured from '../../../../models/IndexFeatured';
import { getSession } from 'next-auth/react';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  console.log(`Received request: Method - ${req.method}, ID - ${req.query.id}`);
  const session = await getSession({ req });
  if (!session || !session.user.isAdmin) {
    return res.status(401).send('signin required');
  }
  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'PUT') {
    console.log('made it');
    return putHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const getHandler = async (req, res) => {
  const blogId = req.query.id;
  await db.connect();
  const blogPost = await IndexFeatured.findById(blogId);

  if (!blogPost) {
    await db.disconnect();
    res.status(404).send('Blog post not found');
    return;
  }

  await db.disconnect();
  res.send(blogPost);
};

const putHandler = async (req, res) => {
  await db.connect();
  const featuredImage = await IndexFeatured.findById(req.query.id);

  if (featuredImage) {
    featuredImage.image = req.body.image;
    featuredImage.alt = req.body.alt;
    featuredImage.link = req.body.link;

    await featuredImage.save();
    await db.disconnect();

    res.send({ message: 'Featured image updated successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Featured image not found' });
  }
};

export default handler;
