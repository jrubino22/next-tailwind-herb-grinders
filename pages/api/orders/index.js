import { getSession } from 'next-auth/react';
import Order from '../../../models/Order';
import db from '../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });

  const { guestSessionId } = req.body;

  if (session) {
    const { user } = session;

    await db.connect();
    const newOrder = new Order({
      ...req.body,
      user: user._id,
      email: user.email,
    });

    const order = await newOrder.save();
    res.status(201).send(order);
  } else if (guestSessionId) {
    console.log('guestId', guestSessionId)
    await db.connect();
    const newOrder = new Order({
      ...req.body,
      email: req.body.shippingAddress.email,
      guestSessionId,
    });

    const order = await newOrder.save();
    res.status(201).send(order);
  } else {
    res.status(401).send('signin required');
  }
};

export default handler;
