import User from '../../../../models/user';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  if (req.method === 'POST') {
    return postHandler(req, res);
  } else if (req.method === 'DELETE') {
    return deleteHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const postHandler = async (req, res) => {
  try {
    await db.connect();
    const user = await User.findById(req.query.id); 
    const newAddress = {
      fullName: req.body.fullName,
      addressLine1: req.body.addressLine1,
      addressLine2: req.body.addressLine2,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.postalCode,
      country: req.body.country,
      phoneNum: user.phoneNum,
    };
    console.log('addressapi', req.query.id, newAddress);
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
