import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer } from 'react';
import { useForm, watch } from 'react-hook-form';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { getError } from '../../../utils/errors';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_IMAGES_SUCCESS':
      return {
        ...state,
        loadingImages: false,
        error: '',
        images: action.payload,
      };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true, errorUpdate: '' };
    case 'UPDATE_SUCCESS':
      return {
        ...state,
        loadingUpdate: false,
        errorUpdate: '',
      };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '' };
    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        loadingUpload: false,
        errorUpload: '',
      };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload };
    default:
      return state;
  }
}

export default function AdminSubproductEditScreen() {
  const { query } = useRouter();
  const subproductId = query.id;
  const [{ loading, error, loadingUpdate, images }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      error: '',
      images: [],
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    const fetchSubProduct = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(
          `/api/admin/subproduct/${subproductId}`
        );
        dispatch({ type: 'FETCH_SUCCESS' });
        setValue('option', data.option);
        setValue('variant', data.variant);
        setValue('sku', data.sku);
        setValue('price', data.price);
        setValue('countInStock', data.countInStock);
        setValue('weight', data.weight);

        // Retrieve the parent ID from the subproduct data
        const parentId = data.parentId;

        // Fetch the parent data using the retrieved parent ID
        const { data: parentData } = await axios.get(
          `/api/admin/products/${parentId}`
        );
        dispatch({ type: 'FETCH_IMAGES_SUCCESS', payload: parentData.images });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    fetchSubProduct();
  }, [subproductId, setValue]);

  // const router = useRouter();

  const submitHandler = async ({
    option,
    variant,
    sku,
    price,
    countInStock,
    weight,
  }) => {
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(`/api/admin/subproduct/${subproductId}`, {
        option,
        variant,
        sku,
        image: {
          url: watch('image'),
          altText: images.find((img) => img.url === watch('image')).name,
        },
        price,
        countInStock,
        weight,
      });
      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('Variant updated successfully');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title={`Edit Variant: ${subproductId}`}>
      <div className="grid md:grid-cols-4 md:gap-5">
        <div>
          <ul>
            <li>
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link href="/admin/orders">Orders</Link>
            </li>
            <li>
              <Link href="/admin/products">
                <a className="font-bold">Products</a>
              </Link>
            </li>
            <li>
              <Link href="/admin/users">Users</Link>
            </li>
            <li>
              <Link href="/admin/media">Media</Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="alert-error">{error}</div>
          ) : (
            <form
              className="fx-auto max-w-screen-md"
              onSubmit={handleSubmit(submitHandler)}
            >
              <h1 className="mb-4 text-xl">{`Edit Variant: ${subproductId}`}</h1>
              <div className="mb-4">
                <label htmlFor="option">Option</label>
                <input
                  type="text"
                  className="w-full"
                  id="option"
                  autoFocus
                  {...register('option', {
                    required: 'Please enter option',
                  })}
                />
                {errors.option && (
                  <div className="text-red-500">{errors.option.message}</div>
                )}
              </div>{' '}
              <div className="mb-4">
                <label htmlFor="variant">Variant</label>
                <input
                  type="text"
                  className="w-full"
                  id="variant"
                  autoFocus
                  {...register('variant', {
                    required: 'Please enter variant',
                  })}
                />
                {errors.variant && (
                  <div className="text-red-500">{errors.variant.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="price">Price</label>
                <input
                  type="text"
                  className="w-full"
                  id="price"
                  autoFocus
                  {...register('price', {
                    required: 'Please enter price',
                  })}
                />
                {errors.price && (
                  <div className="text-red-500">{errors.price.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="sku">SKU</label>
                <input
                  type="text"
                  className="w-full"
                  id="sku"
                  autoFocus
                  {...register('sku', {
                    required: 'Please enter sku',
                  })}
                />
                {errors.sku && (
                  <div className="text-red-500">{errors.sku.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="countInStock">Count In Stock</label>
                <input
                  type="text"
                  className="w-full"
                  id="countInStock"
                  autoFocus
                  {...register('countInStock', {
                    required: 'Please enter countInStock',
                  })}
                />
                {errors.countInStock && (
                  <div className="text-red-500">
                    {errors.countInStock.message}
                  </div>
                )}
              </div>{' '}
              <div className="mb-4">
                <label htmlFor="weight">Weight</label>
                <input
                  type="text"
                  className="w-full"
                  id="weight"
                  autoFocus
                  {...register('weight', {
                    required: 'Please enter weight',
                  })}
                />
                {errors.weight && (
                  <div className="text-red-500">{errors.weight.message}</div>
                )}
              </div>
              <div className="mb-4 variant-img-cont-cont">
  <label htmlFor="image">Variant Image</label>
  <div className="variant-admin-img-container">
    {images.map((image) => (
      <div key={image._id} className="variant-admin-img-wrapper">
        <input
          type="radio"
          id={image._id}
          name="image"
          value={image.url}
          onChange={() => setValue('image', image.url)}
        />
        <label htmlFor={image._id}>
          <img
            src={image.url}
            alt={image.name}
            className="variant-admin-img"
          />
        </label>
      </div>
    ))}
  </div>
</div>
              <div className="mb-4">
                <button disabled={loadingUpdate} className="primary-button">
                  {loadingUpdate ? 'Loading' : 'Update'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

AdminSubproductEditScreen.auth = { adminOnly: true };
