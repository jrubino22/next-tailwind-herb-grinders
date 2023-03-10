import { getSession } from 'next-auth/react';
import User from '../../../models/user';
import db from '../../../utils/db';
import bcryptjs from 'bcryptjs';

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(400).send({ message: `${req.method} not supported` });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).send({ message: 'signin required' });
  }
  const { user } = session;

  const { firstName, lastName, email, tel, password } = req.body;

  if (
    !firstName ||
    !email ||
    !email.includes('@') ||
    (password && password.trim().length < 6)
  ) {
    res.status(422).json({
      message: 'Validation error',
    });
    return;
  }

  await db.connect();
  const toUpdateUser = await User.findById(user._id);
  toUpdateUser.firstName = firstName;
  toUpdateUser.lastName = lastName
  toUpdateUser.email = email;
  toUpdateUser.phoneNum = tel;
  if (password) {
    toUpdateUser.password = bcryptjs.hashSync(password);
  }
  await toUpdateUser.save();
  await db.disconnect();
  res.send({
    message: 'User updated',
  });
}

export default handler;
