import React, { useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

export default function ShippingScreen() {
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm();

  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const { shippingAddress } = cart;
  const router = useRouter();

  useEffect(() => {
    console.log(process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY)
    setValue('firstName', shippingAddress.firstName);
    setValue('lastName', shippingAddress.lastName);
    setValue('addressLine1', shippingAddress.addressLine1);
    setValue('addressLine2', shippingAddress.addressLine2);
    setValue('city', shippingAddress.city);
    setValue('state', shippingAddress.state);
    setValue('postalCode', shippingAddress.postalCode);
    setValue('country', shippingAddress.country);
    setValue('phoneNumber', shippingAddress.phoneNumber);
  }, [setValue, shippingAddress]);

  const submitHandler = ({
    firstName,
    lastName,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    phoneNumber,
  }) => {
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        firstName,
        lastName,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        phoneNumber,
      },
    });

    router.push('/payment');
  };

  return (
    <Layout title="Guest Checkout">
      <CheckoutWizard activeStep={1} />
      <form
        className="mx-auto max-w-screen-md"
        onSubmit={handleSubmit(submitHandler)}
      >
        <h1 className="mb-4 text-xl">Guest Checkout</h1>
        <div className="mb-4">
          <label htmlFor="firstName">First Name</label>
          <input
            className="w-full"
            id="firstName"
            autoFocus
            {...register('firstName', {
              required: 'Please enter first name',
            })}
          />
          {errors.firstName && (
            <div className="text-red-500">{errors.firstName.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="lastName">Last Name</label>
          <input
            className="w-full"
            id="lastName"
            {...register('lastName', {
              required: 'Please enter last name',
            })}
          />
          {errors.lastName && (
            <div className="text-red-500">{errors.lastName.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="addressLine1">Address Line 1</label>
          <GooglePlacesAutocomplete
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}
            autocompletionRequest={{
              types: ['address'],
            }}
            selectProps={{
              id: 'addressLine1',
              placeholder: 'Enter your address',
              ...register('addressLine1', {
                required: 'Please enter address line 1',
              }),
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
        <div className="mb-4">
          <label htmlFor="phone">Phone Number</label>
          <input
            className="w-full"
            id="phone"
            {...register('phone', {
              required: 'Please enter phone number',
            })}
          />
          {errors.phone && (
            <div className="text-red-500">{errors.phone.message}</div>
          )}
        </div>
        <div className="mb-4 flex justify-between">
          <button
            type="button"
            onClick={() => router.push('/cart')}
            className="border-primary border-2 text-primary px-4 py-2 transition-colors duration-300 ease-in-out hover:bg-primary hover:text-white"
          >
            Back to Cart
          </button>
          <button className="primary-button">Next</button>
        </div>
      </form>
    </Layout>
  );
}
