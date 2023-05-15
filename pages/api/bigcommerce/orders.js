import axios from 'axios';

export default async function handler(req, res) {
  const { body: bigCommerceOrderData, method } = req;

  const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
  const BIGCOMMERCE_CLIENT_ID = process.env.BIGCOMMERCE_CLIENT_ID;
  const BIGCOMMERCE_ACCESS_TOKEN = process.env.BIGCOMMERCE_ACCESS_TOKEN;

  if (method === 'POST') {
    try {
      const response = await axios.post(`https://api.bigcommerce.com/stores/${BIGCOMMERCE_STORE_HASH}/v2/orders`, bigCommerceOrderData, {
        headers: {
          'X-Auth-Client': BIGCOMMERCE_CLIENT_ID,
          'X-Auth-Token': BIGCOMMERCE_ACCESS_TOKEN,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
  
      if (!response.data) {
        throw new Error('Order could not be completed');
      }

      return res.status(200).json(response.data);

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}