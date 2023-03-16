import Cookies from 'js-cookie';
import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';
import Autocomplete from 'react-google-autocomplete';
import { useSession } from 'next-auth/react';

export default function ShippingScreen() {
  
  const { status, data: session } = useSession();

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm();

  const [address1, setAddress1] = useState('')

  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { shippingAddress } = cart;
  const router = useRouter();

  useEffect(() => {
    console.log('state',state)
    setValue('fullName', shippingAddress.fullName);
    setValue('addressLine1', shippingAddress.addressLine1);
    setValue('addressLine2', shippingAddress.addressLine2);
    setValue('city', shippingAddress.city);
    setValue('state', shippingAddress.state);
    setValue('postalCode', shippingAddress.postalCode);
    setValue('country', shippingAddress.country);
  }, [setValue, shippingAddress]);


  const submitHandler = async ({
    fullName,
    addressLine1,
    addressLine2,
    state,
    city,
    postalCode,
    country,
  }, e) => {
    console.log("e", e.target.saveAddress)
    e.preventDefault();
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        addressLine1,
        addressLine2,
        state,
        city,
        postalCode,
        country,
      },
    });
    Cookies.set(
      'cart',
      JSON.stringify({
        ...cart,
        shippingAddress: {
          fullName,
          addressLine1,
          addressLine2,
          state,
          city,
          postalCode,
          country,
        },
      })
    );
    if (e.target.saveAddress.checked) {
      const addressData = {
        fullName,
        addressLine1,
        addressLine2,
        state,
        city,
        postalCode,
        country,
      };
      try {
        console.log('useridsession', session.user._id)
        await fetch(`/api/auth/address/${session.user._id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(addressData),
        });
      } catch (error) {
        console.log(error);
      }
    }
    router.push('/payment');
  };

  const handlePlaceSelect = (place) => {
    const addressComponents = place.address_components.reduce(
      (obj, item) => ({
        ...obj,
        [item.types[0]]: item.long_name,
      }),
      {}
    );

    console.log('addycomps', addressComponents);

    setValue('city', addressComponents.locality);
    setValue('state', addressComponents.administrative_area_level_1);
    setValue('postalCode', addressComponents.postal_code);
    setValue('country', addressComponents.country);
    setAddress1(
      `${addressComponents.street_number} ${addressComponents.route}`
    );
    setValue(
      'addressLine1',
      `${addressComponents.street_number} ${addressComponents.route}`
    );
  };

  return (
    <Layout title="Shipping Address">
      <CheckoutWizard activeStep={1} />
      <form
        className="mx-auto max-w-screen-md"
        onSubmit={handleSubmit(submitHandler)}
      >
        <h1 className="mb-4 text-xl">Shipping Address</h1>
        <div className="mb-4">
          <label htmlFor="fullName">Full Name</label>
          <input
            className="w-full"
            id="fullName"
            autoFocus
            {...register('fullName', {
              required: 'Please enter full name',
            })}
          />
          {errors.fullName && (
            <div className="text-red-500">{errors.fullName.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="addressLine1">Address Line 1 </label>

          <Autocomplete
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}
            id="addressLine1"
            className="w-full"
            value={address1}
            onChange={(e) => setAddress1(e.target.value)}
            onPlaceSelected={handlePlaceSelect}
            options={{
              types: ['address'],
            }}
          />
          {errors.addressLine1 && (
            <div className="text-red-500">{errors.addressLine1.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="addressLine2">Address Line 2</label>
          <input
            className="w-full"
            id="addressLine2"
            {...register('addressLine2')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="mb-4">
            <label htmlFor="city">City</label>
            <input
              className="w-full"
              id="city"
              {...register('city', {
                required: 'Please enter city',
              })}
            />
            {errors.city && (
              <div className="text-red-500">{errors.city.message}</div>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="state">State/Province/Region</label>
            <input
              className="w-full"
              id="state"
              {...register('state', {
                required: 'Please enter state/province/region',
              })}
            />
            {errors.state && (
              <div className="text-red-500">{errors.state.message}</div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="mb-4">
            <label htmlFor="postalCode">Postal/Zip Code</label>
            <input
              className="w-full"
              id="postalCode"
              {...register('postalCode', {
                required: 'Please enter postal/zip code',
              })}
            />
            {errors.postalCode && (
              <div className="text-red-500">{errors.postalCode.message}</div>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="country">Country</label>
            <input
              className="w-full"
              id="country"
              {...register('country', {
                required: 'Please enter country',
              })}
            />
            {errors.country && (
              <div className="text-red-500">{errors.country.message}</div>
            )}
          </div>
        </div>
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="saveAddress"
            name="saveAddress"
            defaultChecked
            className="mr-2"
          />
          <label htmlFor="saveAddress">Save address for future orders</label>
        </div>
        <div className="mb-4 flex justify-between">
          <button className="primary-button">Next</button>
        </div>
      </form>
    </Layout>
  );
}

ShippingScreen.auth = true;
