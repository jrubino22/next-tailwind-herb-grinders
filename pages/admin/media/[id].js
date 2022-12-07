import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { getError } from '../../../utils/errors';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true, errorUpdate: '' };
    case 'UPDATE_SUCCESS':
      return {
        ...state,
        loadingUdate: false,
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

export default function AdminMediaEditScreen() {
  const { query } = useRouter();
  const mediaId = query.id;
  const [{ loading, error, loadingUpload, loadingUpdate }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/media/${mediaId}`);
        dispatch({ type: 'FETCH_SUCCESS' });
        setValue('label', data.label);
        setValue('image', data.image);
        setValue('alt', data.alt);
        setValue('link', data.link);
        setValue('order', data.order);
        setValue('live', data.live);
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    fetchData();
  }, [mediaId, setValue]);

  const router = useRouter();

  const uploadHandler = async (e, imageField = 'image') => {
    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
    try {
      dispatch({ type: 'UPLOAD_REQUEST' });
      const {
        data: { signature, timestamp },
      } = await axios('/api/admin/cloudinary-sign');

      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      const { data } = await axios.post(url, formData);

      dispatch({ type: 'UPLOAD_SUCCESS' });
      setValue(imageField, data.secure_url);
      toast.success('File uploaded successfully');
    } catch (err) {
      dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  const submitHandler = async ({ label, image, alt, link, order, live }) => {
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(`/api/admin/media/${mediaId}`, {
        label,
        image,
        alt,
        link,
        order,
        live,
      });
      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('Media updated successfully');
      router.push('/admin/media');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title={`Edit Media: ${mediaId}`}>
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
              <Link href="/admin/products">Products</Link>
            </li>
            <li>
              <Link href="/admin/users">Users</Link>
            </li>
            <li>
              <Link href="/admin/media">
                <a className="font-bold">Media</a>
              </Link>
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
              <h1 className="mb-4 text-xl">{`Edit Media: ${mediaId}`}</h1>
              <div className="mb-4">
                <label htmlFor="label">Label</label>
                <input
                  type="text"
                  className="w-full"
                  id="label"
                  autoFocus
                  {...register('label', {
                    required: 'Please enter label',
                  })}
                />
                {errors.label && (
                  <div className="text-red-500">{errors.label.message}</div>
                )}
              </div>{' '}
              <div className="mb-4">
                <label htmlFor="image">Image</label>
                <input
                  type="text"
                  className="w-full"
                  id="image"
                  autoFocus
                  {...register('image', {
                    required: 'Please enter image',
                  })}
                />
                {errors.image && (
                  <div className="text-red-500">{errors.image.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="imageFile">Upload Image</label>
                <input
                  type="file"
                  className="w-full"
                  id="imageFile"
                  onChange={uploadHandler}
                />
                {loadingUpload && <div>Uploading...</div>}
              </div>
              <div className="mb-4">
                <label htmlFor="alt">Alt Text</label>
                <input
                  type="text"
                  className="w-full"
                  id="alt"
                  autoFocus
                  {...register('alt', {
                    required: 'Please enter alt text',
                  })}
                />
                {errors.alt && (
                  <div className="text-red-500">{errors.alt.message}</div>
                )}
              </div>{' '}

              <div className="mb-4">
                <label htmlFor="link">Link</label>
                <input
                  type="text"
                  className="w-full"
                  id="link"
                  autoFocus    
                  {...register('link')}            
                />
                {errors.link && (
                  <div className="text-red-500">{errors.link.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="order">Order Shown</label>
                <input
                  type="text"
                  className="w-1/6 ml-2"
                  id="order"
                  
                  {...register('order')}  
                />
                {errors.order && (
                  <div className="text-red-500">{errors.order.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="live">Live?</label>
                <input
                  type="checkbox"
                  className="w-1/4"
                  id="live"
                  autoFocus
                  {...register('live')} 
                />
                {errors.live && (
                  <div className="text-red-500">
                    {errors.live.message}
                  </div>
                )}
              </div>
              <div className="mb-4">
                <button disabled={loadingUpdate} className="primary-button">
                  {loadingUpdate ? 'Loading' : 'Update'}
                </button>
              </div>
              <div className="mb-4">
                <Link href={`/admin/media`}>Back</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

AdminMediaEditScreen.auth = { adminOnly: true };
