import Banner from '../../models/Banner';

import data from '../../utils/data';
import db from '../../utils/db';

const handler = async (req, res) => {
  await db.connect();
  await Banner.deleteMany();
  await Banner.insertMany(data.banners)
  await db.disconnect();
  res.send({ message: 'seeded successfully' });
};

export default handler;
