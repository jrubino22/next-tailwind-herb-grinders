import data from '../../utils/data';
import db from '../../utils/db';
import IndexFeatured from '../../models/IndexFeatured';

const handler = async (req, res) => {
  await db.connect();
  await IndexFeatured.insertMany(data.indexFeatured);
  await db.disconnect();
  res.send({ message: 'seeded successfully' });
};

export default handler;
