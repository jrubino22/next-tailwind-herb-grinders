import db from '../../utils/db';
import SubProduct from '../../models/SubProduct';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await db.connect();

    const skuToId = req.body;

    // Get all subproducts
    const subproducts = await SubProduct.find();

    // Prepare bulk update operations
    const ops = subproducts
      .filter((subproduct) => subproduct.sku in skuToId) // Ignore subproducts without matching SKU
      .map((subproduct) => ({
        updateOne: {
          filter: { _id: subproduct._id },
          update: { $set: { bigComId: skuToId[subproduct.sku] } }, // Replace bigComId with the corresponding ID from BigCommerce
        },
      }));

    // Perform bulk update
    await SubProduct.bulkWrite(ops);

    await db.disconnect();

    res.status(200).json({ message: 'Subproducts updated' });
  } else {
    res.status(405).json({ message: 'Method not allowed' }); // only POST is allowed
  }
}