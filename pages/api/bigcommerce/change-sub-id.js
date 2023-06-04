import axios from 'axios';
import db from '../../../utils/db';
import SubProduct from '../../../models/SubProduct';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await db.connect();

    // Set up BigCommerce credentials
    const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
    const BIGCOMMERCE_CLIENT_ID = process.env.BIGCOMMERCE_CLIENT_ID;
    const BIGCOMMERCE_ACCESS_TOKEN = process.env.BIGCOMMERCE_ACCESS_TOKEN;

    let currentPage = 1;
    let products = [];
    let totalPages;

    do {
      const response = await axios.get(
        `https://api.bigcommerce.com/stores/${BIGCOMMERCE_STORE_HASH}/v3/catalog/products?include=variants&page=${currentPage}&limit=250`,
        {
          headers: {
            'X-Auth-Client': BIGCOMMERCE_CLIENT_ID,
            'X-Auth-Token': BIGCOMMERCE_ACCESS_TOKEN,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      
      totalPages = response.data.meta.pagination.total_pages;
    
      // Append newly fetched products to our list
      products = products.concat(response.data.data);
    
      currentPage++;
    } while (currentPage <= totalPages);
    

    // Create a mapping from SKU to ID
    const skuToId = {};
    for (const product of products) {
      for (const variant of product.variants) {
        skuToId[variant.sku] = variant.id; // or use product.id if needed
      }
    }

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
    const keys = Object.keys(skuToId).length;
    res.status(200).json({ keys });
  } else {
    res.status(405).json({ message: 'Method not allowed' }); // only POST is allowed
  }
}
