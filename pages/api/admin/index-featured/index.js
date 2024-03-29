import IndexFeatured from '../../../../models/IndexFeatured';
import { getSession } from 'next-auth/react';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session || (session && !session.user.isAdmin)) {
    return res.status(401).send('signin required');
  }

  if (req.method === 'GET') {
    return getHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const getHandler = async (req, res) => {
  await db.connect();

  const images = await IndexFeatured.find({});

  await db.disconnect();

  res.json(images);
};

export default handler;
