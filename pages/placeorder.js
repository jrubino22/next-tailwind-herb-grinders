import axios from 'axios';
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import { getError } from '../utils/errors';
import { Store } from '../utils/Store';

export default function PlaceOrderScreen() {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { cartItems, shippingAddress, paymentMethod } = cart;
  const guestSessionId = Cookies.get('guestSessionId');
  const BIGCOMMERCE_STORE_HASH = process.env.BIGCOMMERCE_STORE_HASH;
  const BIGCOMMERCE_CLIENT_ID = process.env.BIGCOMMERCE_CLIENT_ID;
  const BIGCOMMERCE_ACCESS_TOKEN = process.env.BIGCOMMERCE_ACCESS_TOKEN;

  const { data: session } = useSession();

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;

  const itemsPrice = round2(
    cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );

  const shippingPrice = itemsPrice > 200 ? 0 : 15;
  const taxPrice = round2(itemsPrice * 0.15);
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  const router = useRouter();

  useEffect(() => {
    if (!paymentMethod) {
      router.push('/payment');
    }
  }, [paymentMethod, router]);

  const [loading, setLoading] = useState(false);

  const placeOrderHandler = async () => {
    try {
      setLoading(true);

      const modifiedCartItems = cartItems.map((item) => {
        const imageUrl =
          item.images && item.images.length > 0
            ? item.images[0].url
            : item.image.url;
        const itemName = item.name
          ? item.name
          : item.parentName && item.variant
          ? `${item.parentName} (${item.variant})`
          : 'Unknown';

        return {
          ...item,
          name: itemName,
          image: imageUrl,
        };
      });

      let orderData = {
        orderItems: modifiedCartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        guestSessionId,
      };

      if (!session) {
        const guestSessionId = Cookies.get('guestSessionId');
        orderData = { ...orderData, guestSessionId };
      }

      const { data } = await axios.post('/api/orders', orderData);

      const custName = session
        ? session.user.firstName
        : shippingAddress.fullName;
      const custEmail = session ? session.user.email : shippingAddress.email;
      const emailData = {
        order: data._id,
        email: custEmail,
        name: custName,
        orderItems: modifiedCartItems,
      };

      const bigCommerceOrderData = {
        "customer_id": 0,
        "billing_address": {
          "first_name": "John",
          "last_name": "Doe",
          "street_1": "123 Elm St",
          "street_2": "",
          "city": "Austin",
          "state": "Texas",
          "zip": "78758",
          "country": "United States",
          "country_iso2": "US",
          "phone": "",
          "email": "john.doe@example.com"
        },
        "shipping_addresses": [
          {
            "first_name": "John",
            "last_name": "Doe",
            "street_1": "123 Elm St",
            "street_2": "",
            "city": "Austin",
            "state": "Texas",
            "zip": "78758",
            "country": "United States",
            "country_iso2": "US",
            "phone": "",
            "email": "john.doe@example.com"
          }
        ],
        "products": [
          {
            "product_id": 112,
            "quantity": 1,
            "price_inc_tax": 100.0,
            "name": "Product Name"
          }
        ]
      };
  
      const bigCommerceOrderResponse = await axios.post(`https://api.bigcommerce.com/stores/${BIGCOMMERCE_STORE_HASH}/v2/orders`, bigCommerceOrderData, {
        headers: {
          'X-Auth-Client': BIGCOMMERCE_CLIENT_ID,
          'X-Auth-Token': BIGCOMMERCE_ACCESS_TOKEN,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
  
      if (!bigCommerceOrderResponse.data) {
        throw new Error('Order could not be completed');
      }

      await axios.post('api/email/confirm-order', emailData);

      setLoading(false);
      dispatch({ type: 'CART_CLEAR_ITEMS' });
      Cookies.set(
        'cart',
        JSON.stringify({
          ...cart,
          cartItems: [],
        })
      );

      router.push(`/order/${data._id}`);
    } catch (err) {
      setLoading(false);
      toast.error(getError(err));
    }
  };

  return (
    <Layout title="Place Order">
      <CheckoutWizard activeStep={3} />
      <h1 className="mb-4 text-xl">Place Order</h1>
      {cartItems.length === 0 ? (
        <div>
          Cart is empty. <Link href="/">Go shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <div className="card p-5">
              <h2 className="mb-2 text-lg">Shipping Address</h2>
              <div>
                {shippingAddress.fullName}, {shippingAddress.addressLine1},{' '}
                {shippingAddress.addressLine2
                  ? `${shippingAddress.addressLine2}, `
                  : ''}{' '}
                {shippingAddress.city},{shippingAddress.state},{' '}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </div>
              <div>
                <Link href="/shipping">Edit</Link>
              </div>
            </div>
            <div className="card p-5">
              <h2 className="mb-2 text-lg">Payment Method</h2>
              <div>{paymentMethod}</div>
              <div>
                <Link href="/payment">Edit</Link>
              </div>
            </div>
            <div className="card overflow-x-auto p-5">
              <h2 className="mb-2 text-lg">Order Items</h2>
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-5 text-left">Item</th>
                    <th className="px-5 text-right">Quantity</th>
                    <th className="px-5 text-right">Price</th>
                    <th className="px-5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item._id} className="border-b">
                      <td>
                        <Link href={`/product/${item.slug}`}>
                          <a className="flex items-center">
                            <Image
                              src={
                                item.images
                                  ? item.images[0].url
                                  : item.image.url
                              }
                              alt={
                                item.images
                                  ? item.images[0].altText
                                  : item.image.altText
                              }
                              width={50}
                              height={50}
                            ></Image>
                            &nbsp;
                            {item.name
                              ? item.name
                              : `${item.parentName} (${item.variant})`}
                          </a>
                        </Link>
                      </td>
                      <td className="p-5 text-right">{item.quantity}</td>
                      <td className="p-5 text-right">${item.price}</td>
                      <td className="p-5 text-right">
                        ${item.quantity * item.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <Link href="/cart">Edit</Link>
              </div>
            </div>
          </div>
          <div>
            <div className="card p-5">
              <h2 className="mb-2 text-lg">Order Summary</h2>
              <ul>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Items</div>
                    <div>${itemsPrice}</div>
                  </div>
                </li>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Tax</div>
                    <div>${taxPrice}</div>
                  </div>
                </li>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Shipping</div>
                    <div>${shippingPrice}</div>
                  </div>
                </li>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Total</div>
                    <div>${totalPrice}</div>
                  </div>
                </li>
                <li>
                  <button
                    disabled={loading}
                    onClick={placeOrderHandler}
                    className="primary-button w-full"
                  >
                    {loading ? 'Loading...' : 'Place Order'}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

// PlaceOrderScreen.auth = true;
