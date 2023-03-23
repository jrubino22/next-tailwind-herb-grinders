import { getSession } from 'next-auth/react';
import BlogPost from '../../../../models/BlogPost' 
import db from '../../../../utils/db'

const handler = async (req, res) => {
    const session = await getSession({ req })
    if (!session || !session.user.isAdmin) {
        return res.status(401).send('admin signin required');
    }
    if (req.method === 'POST'){
        return postHandler(req, res) 
    }else if (req.method === 'GET'){
        return getHandler(req, res)
    }
     else {
        return res.status(400).send({message: 'Method not allowed'})
    }
};

const postHandler = async (req, res) => {
    await db.connect();
    const newBlogPost = new BlogPost ({
        title: 'New Blog Post',
        slug: 'new-blog-post',
        subtitle: 'short but engaging description',
        author: 'can be blank',
        content: 'Write a captivating blog post here',
        metaDesc: 'seo friendly description around 150-160 chars',
        image: {
            url: '',
            altText: 'seo friendly image description',
        },
        isActive: false,
    });

    const blogPost = await newBlogPost.save();
    await db.disconnect();
    res.send({ message: 'Blog post created successfully', blogPost})
}

const getHandler = async (req, res) => {
    db.connect()
    const blogPosts = await BlogPost.find({})
    await db.disconnect();
    res.send(blogPosts)
}

export default handler;