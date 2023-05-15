import Cookies from 'js-cookie';
import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';
import Autocomplete from 'react-google-autocomplete';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function ShippingScreen() {
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm();

  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  // const { shippingAddress } = cart;
  const router = useRouter();

  const [address1, setAddress1] = useState('');
  const [phone, setPhone] = useState('');

  const [phoneError, setPhoneError] = useState('');

  function handleOnChange(value) {
    setPhone(value);
    setPhoneError('');
  }

  const submitHandler = ({
    firstName,
    lastName,
    email,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
  }) => {

    if (!phone || !isValidPhoneNumber(phone)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        firstName,
        lastName,
        email,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        phoneNum: phone,
      },
    });
    Cookies.set(
      'cart',
      JSON.stringify({
        ...cart,
        shippingAddress: {
          firstName,
          lastName,
          email,
          phoneNum: phone,
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          country,
        },
      })
    );
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
            autoFocus
            {...register('lastName', {
              required: 'Please enter last name',
            })}
          />
          {errors.lastName && (
            <div className="text-red-500">{errors.lastName.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            {...register('email', {
              required: 'Please enter your email',
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
                message: 'Please enter a valid email',
              },
            })}
            className="w-full"
          />
          {errors.email && (
            <div className="text-red-500">{errors.email.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="phoneNum">Phone Number</label>
          <PhoneInput
            id="phoneNum"
            value={phone}
            onChange={handleOnChange}
            defaultCountry="US"
          />
          {phoneError && <div className="text-red-500">{phoneError}</div>}
        </div>
        <div className="mb-4">
          <label htmlFor="addressLine1">Address Line 1 </label>
          <Autocomplete
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}
            id="addressLine1"
            className="w-full"
            placeholder=""
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
