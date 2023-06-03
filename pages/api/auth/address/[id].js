import User from '../../../../models/user';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'POST') {
    return postHandler(req, res);
  // } else if (req.method === 'DELETE') {
  //   return deleteHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const getHandler = async (req, res) => {
  try {
    await db.connect();
    const user = await User.findById(req.query.id);
    const addresses = user.address;
    await db.disconnect();
    res.send(addresses)
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
}

const postHandler = async (req, res) => {
  try {
    await db.connect();
    const user = await User.findById(req.query.id);
    console.log('first', req.body.firstName);
    console.log('last', req.body.lastName); 
    const newAddress = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      city: req.body.city,
      state: req.body.state,
      postalCode: req.body.postalCode,
      country: req.body.country,
      phoneNum: user.phoneNum,
    };
    user.address.push(newAddress);
    await user.save();
    await db.disconnect();
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
};

export default handler;
