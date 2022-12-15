import SubProduct from '../../models/SubProduct';

import data from '../../utils/data';
import db from '../../utils/db';

const handler = async (req, res) => {
  await db.connect();
  await SubProduct.deleteMany();
  await SubProduct.insertMany(data.subproducts);
  await db.disconnect();
  res.send({ message: 'seeded successfully' });
};

export default handler;
