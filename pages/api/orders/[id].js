import { getSession } from 'next-auth/react';
import Order from '../../../models/Order';
import db from '../../../utils/db';
import cookie from 'cookie';

const handler = async (req, res) => {
  const session = await getSession({ req });

  const parsedCookies = cookie.parse(req.headers.cookie || '');

  const guestSessionId = parsedCookies.guestSessionId;

  await db.connect();

  const order = await Order.findById(req.query.id);
  if (
    (session && session.user._id === order.user.toString()) ||
    (guestSessionId && guestSessionId === order.guestSessionId) ||
    (session && session.user.isAdmin)
  ) {
    await db.disconnect();
    res.send(order);
  } else {
    await db.disconnect();
    res.status(401).send('Access denied');
  }
};

export default handler;
