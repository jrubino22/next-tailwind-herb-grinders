import db from '../../../utils/db';
import Product from '../../../models/Product';
import Review from '../../../models/Reviews';
    
    const handler = async (req, res) => {
      await db.connect();
    
      if (req.method === 'GET') {
        const { productId } = req.query;
        const reviews = await Review.find({ productId }).lean();
    
        if (!reviews) {
          res.status(404).json({ message: 'No reviews found for this product.' });
        } else {
          res.status(200).json(reviews);
        }
      } else if (req.method === 'POST') {
        const { productId, name, email, rating, title, content } = req.body;
    
        const newReview = new Review({
          productId,
          name,
          email,
          rating,
          title,
          content,
        });
    
        const savedReview = await newReview.save();
    
        const product = await Product.findById(productId);
    
        product.numReviews += 1;
        product.rating =
          (product.rating * (product.numReviews - 1) + rating) / product.numReviews;
    
        await product.save();
    
        res.status(201).json(savedReview);
      } else {
        res.setHeader('Allow', 'POST, GET');
        res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    
      await db.disconnect();
    };
    
    export default handler;
