import { getSession } from 'next-auth/react';
import Page from '../../../../models/Page' 
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
    const newPage = new Page ({
        title: 'New Page',
        slug: 'new-page',
        subtitle: 'optional subtitle',
        content: 'Page contents here',
        metaDesc: 'seo friendly description around 150-160 chars',
        image: {
            url: '',
            altText: 'seo friendly image description',
        },
        isActive: false,
    });

    const createdPage = await newPage.save();
    await db.disconnect();
    res.send({ message: 'Page created successfully', createdPage})
}

const getHandler = async (req, res) => {
    db.connect()
    const Pages = await Page.find({})
    await db.disconnect();
    res.send(Pages)
}

export default handler;