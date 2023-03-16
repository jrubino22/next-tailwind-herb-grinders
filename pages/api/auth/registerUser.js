import bcryptjs from 'bcryptjs';
import db from '../../../utils/db';
import User from '../../../models/user';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { firstName, lastName, email, phoneNum, password, registeredUser } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    console.log('register-path', firstName, req.body )
    await db.connect();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await db.disconnect();
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      phoneNum,
      password: hashedPassword,
      registeredUser,
    });
    const newUser = await user.save();
    await db.disconnect();
    res.status(201).json({ message: 'User created', user: newUser });
  } catch (err) {
    await db.disconnect();
    res.status(500).json({ message: 'Error creating user' });
  }
}