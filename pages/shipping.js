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
  const { data: session } = useSession();

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm();

  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [address1, setAddress1] = useState('');

  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  // const { shippingAddress } = cart;
  const router = useRouter();


  useEffect(() => {
    const fetchUserAddresses = async () => {
      try {
        const response = await fetch(`/api/auth/address/${session.user._id}`);
        const data = await response.json();
        setUserAddresses(data);
        setShowForm(data.length < 1);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserAddresses();
  }, [session.user._id]);

  const updateSelectedAddress = (address) => {
    const fullAddress = {
      address,
      phoneNum: session.user.phoneNum,
      email: session.user.email,
    };
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: address,
    });
    Cookies.set(
      'cart',
      JSON.stringify({
        ...cart,

        shippingAddress: fullAddress,
      })
    );
  };

  const renderAddressOptions = () => {
    return (
      <>
        <h2>Select Shipping Address</h2>
        <div className="address-options">
          {userAddresses.map((address, index) => (
            <div
              key={index}
              className={`address-option ${
                selectedAddress === address ? 'selected' : ''
              }`}
              onClick={() => {
                setSelectedAddress(address);
                setShowForm(false);
              }}
            >
              <div className="address-name">{address.firstName} {' '} {address.lastName}</div>
              <div className="address-line">
                {address.addressLine1}
                {address.addressLine2 && `, ${address.addressLine2}`}
              </div>
              <div className="address-line">
                {address.city}, {address.state}, {address.postalCode}
              </div>
              <div className="address-line">{address.country}</div>
            </div>
          ))}
          <div
            className={`address-option ${
              selectedAddress === null ? 'selected' : ''
            }`}
            onClick={() => {
              setSelectedAddress(null);
              setShowForm(true);
            }}
          >
            <div class="plus-icon-container">
              Add New Address <br />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="2rem"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M19,13h-6v6c0,0.553 -0.447,1 -1,1s-1,-0.447 -1,-1v-6h-6c-0.553,0 -1,-0.447 -1,-1s0.447,-1 1,-1h6v-6c0,-0.553 0.447,-1 1,-1s1,0.447 1,1v6h6c0.553,0 1,0.447 1,1S19.553,13 19,13z" />
              </svg>
            </div>
          </div>
        </div>
      </>
    );
  };

  const submitHandler = async (
    { firstName, lastName, addressLine1, addressLine2, state, city, postalCode, country },
    e
  ) => {
    e.preventDefault();
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        firstName,
        lastName,
        email: session.user.email,
        phoneNum: session.user.phoneNum,
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
          firstName,
          lastName,
          email: session.user.email,
          phoneNum: session.user.phoneNum,
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
        firstName,
        lastName,
        addressLine1,
        addressLine2,
        state,
        city,
        postalCode,
        country,
      };
      try {
        console.log('useridsession', addressData);
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
    router.push('/placeorder');
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
    <Layout title="Shipping Address">
      <CheckoutWizard activeStep={1} />

      {userAddresses.length > 0 && renderAddressOptions()}
      {!showForm && selectedAddress && (
        <div className="continue-button-container">
          <button
            className="continue-button"
            onClick={() => {
              updateSelectedAddress(selectedAddress);
              router.push('/payment');
            }}
          >
            Continue
          </button>
        </div>
      )}
      {showForm && (
        <form
          className="mx-auto max-w-screen-md"
          onSubmit={handleSubmit(submitHandler)}
        >
          <h2 className="mb-4 text-xl">Enter Shipping Address</h2>
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
      )}
    </Layout>
  );
}

ShippingScreen.auth = true;
