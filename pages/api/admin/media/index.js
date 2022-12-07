import { getSession } from 'next-auth/react';
import Banner from '../../../../models/Banner';
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
  const newBanner = new Banner({
    label: ' ',
    image: 'none',
    alt: ' ',
    link: ' ',
    order: ' ',
    live: false,
  });

  const banner = await newBanner.save();
  await db.disconnect();
  res.send({ message: 'Banner created successfully', banner });
};

const getHandler = async (req, res) => {
  await db.connect();
  const banners = await Banner.find({});
  await db.disconnect();
  res.send(banners);
};

export default handler;
