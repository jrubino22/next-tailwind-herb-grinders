import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BigcomButton = () => {
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    if (!update) return;

    // async function updateSubProductsWithBigCommerceIds() {
    //   const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
    //   const BIGCOMMERCE_CLIENT_ID = process.env.BIGCOMMERCE_CLIENT_ID;
    //   const BIGCOMMERCE_ACCESS_TOKEN = process.env.BIGCOMMERCE_ACCESS_TOKEN;

    //   // Get product list from BigCommerce API
    //   const response = await axios.get(
    //     `https://api.bigcommerce.com/stores/${BIGCOMMERCE_STORE_HASH}/v3/catalog/products?include=variants`,
    //     {
    //       headers: {
    //         'X-Auth-Client': BIGCOMMERCE_CLIENT_ID,
    //         'X-Auth-Token': BIGCOMMERCE_ACCESS_TOKEN,
    //         'Content-Type': 'application/json',
    //         Accept: 'application/json',
    //       },
    //     }
    //   );

    //   const products = response.data.data;

    //   // Create a mapping from SKU to ID
    //   const skuToId = {};
    //   for (const product of products) {
    //     for (const variant of product.variants) {
    //       skuToId[variant.sku] = variant.id; // or use product.id if needed
    //     }
    //   }

    //   console.log('skitoid', skuToId);
    async function makeApiCall() {
      const response = await axios.post('/api/bigcommerce/change-sub-id')
        console.log('response', response)
      if (!response.ok) {
        // handle error
        console.error('Failed to update subproducts');
      }

    }

    makeApiCall().then(() => setUpdate(false));
  }, [update]);

  return (
    <button onClick={() => setUpdate(true)}>update id</button>
  );
}

export default BigcomButton;