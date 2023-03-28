import { useRouter } from 'next/router';
import React, { useEffect, useReducer, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { getError } from '../../../utils/errors';
import DynamicSimpleMDE from '../../../components/DynamicSimpleMDE';
import 'easymde/dist/easymde.min.css';

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

export default function AdminCategoryEditScreen() {
  const { query } = useRouter();
  const categoryId = query.id;
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

  const [isTags, setIsTags] = useState(false);
  const [imageURL, setImageURL] = useState('');
  const [useCategoryImageBanner, setUseCategoryImageBanner] = useState(false);
  const [prettyDescription, setPrettyDescription] = useState('');

  const handleEditorChange = (value) => {
    setPrettyDescription(value);
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/categories/${categoryId}`);
        dispatch({ type: 'FETCH_SUCCESS' });
        setValue('title', data.title);
        setValue('slug', data.slug);
        setValue('description', data.description);
        setValue('metaDesc', data.metaDesc);
        setValue('isTags', data.isTags);
        setValue('productTags', data.productTags.join(', '));
        setValue('altText', data.image.altText);
        setIsTags(data.isTags);
        setImageURL(data.image.url);
        setUseCategoryImageBanner(data.useBanner);
        setPrettyDescription(data.description);
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    fetchCategory();
  }, [categoryId, setValue]);

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

  const handleCategoryImageBannerChange = (event) => {
    setUseCategoryImageBanner(event.target.checked);
  };

  const handleIsTagsChange = (event) => {
    setIsTags(event.target.checked);
  };

  const submitHandler = async ({
    title,
    slug,
    metaDesc,
    productTags,
    altText,
  }) => {
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(`/api/admin/categories/${categoryId}`, {
        title,
        slug,
        description: prettyDescription,
        metaDesc,
        useCategoryImageBanner,
        isTags,
        productTags: productTags.split(',').map((tag) => tag.trim()),
        image: { imageURL, altText },
        url: imageURL,
        altText: altText,
      });
      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('Category updated successfully');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title={`Edit Category: ${categoryId}`}>
      <div className="grid md:grid-cols-4 md:gap-5">
        <div>
          <ul>
            <li>
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link href="/admin/categories">
                <a className="font-bold">Categories</a>
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
              <h1 className="mb-4 text-xl">{`Edit Category: ${categoryId}`}</h1>

              {/* Add other form fields here */}
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
                <label htmlFor="metaDesc" className="block">
                  Meta Description
                </label>{' '}
                {/* Add the "block" class */}
                <textarea
                  id="metaDesc"
                  className="block w-full" // Add these classes
                  {...register('metaDesc', { required: true })}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description">description</label>
                <DynamicSimpleMDE
                  value={prettyDescription}
                  onChange={(value) => handleEditorChange(value)}
                />
                {/* {errors.description && (
                  <div className="text-red-500">
                    {errors.description.message}
                  </div>
                )} */}
              </div>

              <div>
                <label htmlFor="isTags">
                  Add products via product tags
                  <input
                    type="checkbox"
                    id="isTags"
                    name="isTags"
                    checked={isTags}
                    onChange={handleIsTagsChange}
                  />
                </label>
              </div>

              {isTags && (
                <div>
                  <label htmlFor="productTags">
                    Product Tags - separate via comma
                    <input
                      type="text"
                      id="productTags"
                      name="productTags"
                      {...register('productTags')}
                    />
                  </label>
                </div>
              )}

              <div>
                <label htmlFor="useCategoryImageBanner">
                  Use category banner image
                  <input
                    type="checkbox"
                    id="useCategoryImageBanner"
                    name="useCategoryImageBanner"
                    checked={useCategoryImageBanner}
                    onChange={handleCategoryImageBannerChange}
                  />
                </label>
              </div>

              {useCategoryImageBanner && (
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
                    <label htmlFor="imageURL">Image</label>
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
              )}

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
AdminCategoryEditScreen.auth = { adminOnly: true };
