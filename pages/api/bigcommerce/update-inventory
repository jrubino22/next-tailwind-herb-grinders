import db from '../../../utils/db';
import Product from '../../../models/Product';
import SubProduct from '../../../models/SubProduct';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await db.connect();

    const { data } = req.body;

    // Update inventory based on if it is a base product or a variant
    if ('product_id' in data) {
      // Variant
      const variant = await SubProduct.findOne({ sku: data.sku });
      if (variant) {
        variant.countInStock = data.inventory_level;
        await variant.save();
      }
    } else {
      // Base Product
      const product = await Product.findOne({ sku: data.sku });
      if (product) {
        product.countInStock = data.inventory_level;
        await product.save();
      }
    }

    await db.disconnect();

    res.status(200).json({ message: 'Inventory updated' });
  } else {
    res.status(405).json({ message: 'Method not allowed' }); // only POST is allowed
  }
}
