import { getSession } from 'next-auth/react';
import Banner from '../../../../../models/Banner';
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
  const banner = await Banner.findById(req.query.id);
  await db.disconnect();
  res.send(banner);
};
const putHandler = async (req, res) => {
  await db.connect();
  const banner = await Banner.findById(req.query.id);
  if (banner) {
    banner.label = req.body.label;
    banner.image = req.body.image;
    banner.alt = req.body.alt;
    banner.link = req.body.link;
    banner.order = req.body.order;
    banner.live = req.body.live;
    await banner.save();
    await db.disconnect();
    res.send({ message: 'banner updated successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'banner not found' });
  }
};

const deleteHandler = async (req, res) => {
  await db.connect();
  const banner = await Banner.findById(req.query.id);
  if (banner) {
    await banner.remove();
    await db.disconnect();
    res.send({ message: 'banner deleted successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'banner not found' });
  }
};
export default handler;
