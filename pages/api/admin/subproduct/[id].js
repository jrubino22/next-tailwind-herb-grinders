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
//   } else if (req.method === 'PUT') {
//     return putHandler(req, res, user);
//   } else if (req.method === 'DELETE') {
//     return deleteHandler(req, res, user);
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

export default handler;
