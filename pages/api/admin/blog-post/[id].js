import { getSession } from 'next-auth/react';
import BlogPost from '../../../../models/BlogPost';
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
  const blogId = req.query.id;
  await db.connect();
  const blogPost = await BlogPost.findById(blogId);

  if (!blogPost) {
    await db.disconnect();
    res.status(404).send('Blog post not found');
    return;
  }

  await db.disconnect();
  res.send(blogPost);
};

const putHandler = async (req, res) => {
  const blogId = req.query.id;
  await db.connect();
  const blogPost = await BlogPost.findById(blogId);

  if (!blogPost) {
    await db.disconnect();
    res.status(404).send('Blog post not found');
    return;
  }

  const { title, slug, subtitle, author, content, metaDesc, image } = req.body;

  blogPost.title = title;
  blogPost.slug = slug;
  blogPost.subtitle = subtitle;
  blogPost.author = author;
  blogPost.content = content;
  blogPost.metaDesc = metaDesc;
  blogPost.image = image;

  await blogPost.save();
  await db.disconnect();

  res.send({ message: 'Blog post updated successfully', blogPost });
};

export default handler;
