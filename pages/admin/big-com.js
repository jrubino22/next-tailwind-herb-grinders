import db from '../../utils/db';
import SubProduct from '../../models/SubProduct';
import axios from 'axios';

export async function bigcom() {
  async function updateSubProductsWithBigCommerceIds() {
    const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
    const BIGCOMMERCE_CLIENT_ID = process.env.BIGCOMMERCE_CLIENT_ID;
    const BIGCOMMERCE_ACCESS_TOKEN = process.env.BIGCOMMERCE_ACCESS_TOKEN;

    // Get product list from BigCommerce API
    const response = await axios.get(
      `https://api.bigcommerce.com/stores/${BIGCOMMERCE_STORE_HASH}/v3/catalog/products?include=variants`,
      {
        headers: {
          'X-Auth-Client': BIGCOMMERCE_CLIENT_ID,
          'X-Auth-Token': BIGCOMMERCE_ACCESS_TOKEN,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    const products = response.data.data;

    // Create a mapping from SKU to ID
    const skuToId = {};
    for (const product of products) {
      for (const variant of product.variants) {
        skuToId[variant.sku] = variant.id; // or use product.id if needed
      }
    }

    console.log('skitoid', skuToId);
    await db.connect();
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
  }

  return (
    <button onclick={() => updateSubProductsWithBigCommerceIds()}>
      update id
    </button>
  );
}
