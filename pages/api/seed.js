

import data from '../../utils/data';
import db from '../../utils/db';

const handler = async (req, res) => {
  await db.connect();
  await Blog.deleteMany();
  await Blog.insertOne(data.blog);
  await db.disconnect();
  res.send({ message: 'seeded successfully' });
};

export default handler;
