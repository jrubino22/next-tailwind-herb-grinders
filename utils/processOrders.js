import axios from 'axios';

export async function processBigCommerceOrders(shippingAddress, items) {
  let products = items.map((item) => {
    let product = {};
    if (!item.parentBigComId) {
      product = {
        product_id: item.bigComId,
        quantity: item.quantity,
      };
    } else {
      product = {
        product_id: item.parentBigComId,
        quantity: item.quantity,
        variant_id: item.bigComId,
      };
    }
    console.log('product', product);
    return product;
  });

  const bigCommerceOrderData = {
    customer_id: 0,
    billing_address: {
      first_name: shippingAddress.firstName,
      last_name: shippingAddress.lastName,
      street_1: shippingAddress.addressLine1,
      street_2: shippingAddress.addressLine2
        ? shippingAddress.addressLine2
        : '',
      city: shippingAddress.city,
      state: shippingAddress.state,
      zip: shippingAddress.postalCode,
      country: shippingAddress.country,
      country_iso2: 'US',
      phone: shippingAddress.phoneNum,
      email: shippingAddress.email,
    },
    shipping_addresses: [
      {
        first_name: shippingAddress.firstName,
        last_name: shippingAddress.lastName,
        street_1: shippingAddress.addressLine1,
        street_2: shippingAddress.addressLine2
          ? shippingAddress.addressLine2
          : '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.postalCode,
        country: shippingAddress.country,
        country_iso2: 'US',
        phone: shippingAddress.phoneNum,
        email: shippingAddress.email,
      },
    ],
    products: products,
  };
  const bigCommerceproductvar = await axios.get('/api/bigcommerce/orders');

  console.log('bigcomvar', bigCommerceproductvar);

  const bigCommerceOrderResponse = await axios.post(
    '/api/bigcommerce/orders',
    bigCommerceOrderData
  );

  if (!bigCommerceOrderResponse.data) {
    throw new Error('Order could not be completed');
  }
}
