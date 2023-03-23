import Blog from '../../../../models/Blog';
import db from '../../../../utils/db';
import { getSession } from 'next-auth/react';

const handler = async (req, res) => {
    const session = await getSession({ req });
    if (!session || !session.user.isAdmin) {
      return res.status(401).send('admin signin required');
    }
    //const { user } = session;
    if (req.method === 'GET') {
      return getHandler(req, res);
    } else if (req.method === 'POST') {
      return putHandler(req, res);
    } else {
      return res.status(400).send({ message: 'Method not allowed' });
    }
  };

const getHandler = async (req, res) => {
  await db.connect();
  const blog = await Blog.findById('641b7f313c20b64cd274b04b');
  await db.disconnect();
  res.send(blog);
};

const putHandler = async (req, res) => {
  await db.connect();
  const blog = await Blog.findById('641b7f313c20b64cd274b04b');
  if (blog) {
    blog.title = req.body.title;
    blog.description = req.body.description;
    blog.metaDesc = req.body.metaDesc;
    blog.image.url = req.body.image.url;
    blog.image.altText = req.body.image.altText;
    await blog.save();
    await db.disconnect();
    res.send({ message: 'Blog page updated successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Blog page not found' });
  }
};

export default handler;