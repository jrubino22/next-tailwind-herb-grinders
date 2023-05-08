import { getSession } from 'next-auth/react';
import Page from '../../../../models/Page';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });

  if (!session || !session.user.isAdmin) {
    return res.status(401).send('admin signin required');
  }

  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'PUT') {
    return putHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const getHandler = async (req, res) => {
  const pageId = req.query.id;
  await db.connect();
  const thisPage = await Page.findById(pageId);

  if (!thisPage) {
    await db.disconnect();
    res.status(404).send('Page not found');
    return;
  }

  await db.disconnect();
  res.send(thisPage);
};

const putHandler = async (req, res) => {
  const PageId = req.query.id;
  await db.connect();
  const thisPage = await Page.findById(PageId);

  if (!thisPage) {
    await db.disconnect();
    res.status(404).send('Page not found');
    return;
  }

  const { title, slug, subtitle, content, metaDesc, image, isActive } =
    req.body;

  thisPage.title = title;
  thisPage.slug = slug;
  thisPage.subtitle = subtitle;
  thisPage.content = content;
  thisPage.metaDesc = metaDesc;
  thisPage.image = image;
  thisPage.isActive = isActive;

  await thisPage.save();
  await db.disconnect();

  res.send({ message: 'Page updated successfully', thisPage });
};

export default handler;
