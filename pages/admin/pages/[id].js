import { useRouter } from 'next/router';
import React, { useEffect, useReducer, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import DynamicSimpleMDE from '../../../components/DynamicSimpleMDE';
import 'easymde/dist/easymde.min.css';
import axios from 'axios';
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
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '' };
    case 'UPLOAD_SUCCESS':
      return { ...state, loadingUpload: false, errorUpload: '' };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true, errorUpdate: '' };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false, errorUpdate: '' };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    default:
      return state;
  }
}

export default function AdminPageEditScreen() {
  const { query } = useRouter();
  const pageId = query.id;
  const [{ loading, error, loadingUpload, errorUpload }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      error: '',
      loadingUpload: false,
      errorUpload: '',
    }
  );

  const { handleSubmit, setValue, register } = useForm();

  const [content, setContent] = useState('');
  const [imageURL, setImageURL] = useState('');

  useEffect(() => {
    const fetchPage = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/pages/${pageId}`);
        dispatch({ type: 'FETCH_SUCCESS' });
        setValue('title', data.title);
        setValue('slug', data.slug);
        setValue('subtitle', data.subtitle);
        setValue('metaDesc', data.metaDesc);
        setValue('altText', data.image.altText);
        setValue('isActive', data.isActive);
        setContent(data.content);
        setImageURL(data.image.url);
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    fetchPage();
  }, [pageId, setValue]);

  const uploadHandler = async (e) => {
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

      setImageURL(data.secure_url);
    } catch (err) {
      dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
    }
  };

  const submitHandler = async ({
    title,
    slug,
    subtitle,
    author,
    metaDesc,
    altText,
    isActive,
  }) => {
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(`/api/admin/pages/${pageId}`, {
        title,
        slug,
        subtitle,
        author,
        content,
        metaDesc,
        isActive,
        image: { url: imageURL, altText },
      });
      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('Page updated successfully');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title={`Edit Page: ${pageId}`}>
      <div className="grid md:grid-cols-4 md:gap-5">
        <div>
          <ul>
            {' '}
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
              <Link href="/admin/media">Media</Link>
            </li>
            <li>
              <Link href="/admin/pages">
                <a className="font-bold">Pages</a>
              </Link>
            </li>
            <li>
              <Link href="/admin/blog">Blog</Link>
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
              <h1 className="mb-4 text-xl">{`Edit Page: ${pageId}`}</h1>

              <div className="mb-4">
                <label className="mr-2" htmlFor="isActive">
                  Active
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    className="ml-1"
                    {...register('isActive')}
                  />
                </label>
              </div>

              <div className="mb-4">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  {...register('title', { required: true })}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="slug">Slug</label>
                <input
                  id="slug"
                  type="text"
                  {...register('slug', { required: true })}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="subtitle">Subtitle</label>
                <input
                  id="subtitle"
                  type="text"
                  {...register('subtitle')}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="metaDesc">Meta Description</label>
                <input
                  id="metaDesc"
                  type="text"
                  {...register('metaDesc', { required: true })}
                />
              </div>

              <div className="image-section bg-gray-200 p-4 rounded-md mb-4">
                <div className="mb-4">
                  <label htmlFor="image">Update Image</label>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => uploadHandler(e)}
                  />
                  {loadingUpload && <div>Uploading...</div>}
                  {errorUpload && (
                    <div className="alert-error">{errorUpload}</div>
                  )}
                </div>
                <div className="mb-4">
                  <label htmlFor="imageURL">Image (optional)</label>
                  <img
                    id="imageURL"
                    src={imageURL}
                    alt="altText"
                    className="object-cover rounded-md border border-gray-300"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="altText">Image Alt Text</label>
                  <input id="altText" type="text" {...register('altText')} />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="content">Content</label>
                <DynamicSimpleMDE
                  value={content}
                  onChange={(value) => setContent(value)}
                  style={{ height: '1000px', overflow: 'auto' }}
                />
              </div>
              <div className="mb-4">
                <button className="primary-button">Update</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
AdminPageEditScreen.auth = { adminOnly: true };
