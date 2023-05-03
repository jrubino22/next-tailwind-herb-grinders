import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { getError } from '../../utils/errors';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_BLOG_PAGE_SUCCESS':
      return { ...state, blogPage: action.payload };
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, blogPosts: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
      case 'UPLOAD_REQUEST':
        return { ...state, loadingUpload: true, errorUpload: '' };
      case 'UPLOAD_SUCCESS':
        return { ...state, loadingUpload: false, errorUpload: '' };
      case 'UPLOAD_FAIL':
        return { ...state, loadingUpload: false, errorUpload: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      state;
  }
}

export default function AdminBlogScreen() {
  const router = useRouter();

  const [
    {
      loading,
      error,
      loadingUpload,
      errorUpload,
      blogPosts,
      loadingCreate,
      successDelete,
      loadingDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    blogPosts: [],
    error: '',
    blogPage: null,
    loadingUpload: false,
    errorUpload: '',
  });

  const { register, handleSubmit, setValue } = useForm();

  const [imageURL, setImageURL] = useState('');

  const createHandler = async () => {
    if (!window.confirm('Create new blog post?')) {
      return;
    }
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(`/api/admin/blog-post`);
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Blog post created successfully');
      router.push(`/admin/blog/${data._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  const updateBlogPageHandler = handleSubmit(async (formData) => {
    try {
      await axios.put(`/api/admin/blog`, {
        ...formData,
        // image: {
        //   url: imageURL,
        //   altText: formData.altText,
        // },
      });
      toast.success('Blog page updated successfully');
    } catch (err) {
      toast.error(getError(err));
    }
  });

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

  useEffect(() => {
    const fetchBlogPageData = async () => {
      try {
        const { data: blogP } = await axios.get('/api/admin/blog');
        dispatch({ type: 'FETCH_BLOG_PAGE_SUCCESS', payload: blogP });
        setImageURL(blogP.image.url);
        setValue('title', blogP.title);
        setValue('description', blogP.description);
        setValue('metaDescription', blogP.metaDesc);
        setValue('altText', blogP.image.altText);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchBlogPageData();
    const fetchPostData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/blog-post`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchPostData();
    }
  }, [setValue, successDelete]);

  const deleteHandler = async (postId) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/admin/blog-post/${postId}`);
      dispatch({ type: 'DELETE_SUCCESS' });
      toast.success('Blog post deleted successfully');
    } catch (err) {
      dispatch({ type: 'DELETE_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title="Admin Blog">
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
              <Link href="/admin/blog">
                <a className="font-bold">Blog</a>
              </Link>
            </li>
          </ul>
        </div>

        <div className="overflow-x-auto md:col-span-3">
          <div className="mb-8 bg-gray-200 p-6 rounded">
            <h2 className="mb-4 text-xl">Update Blog Page</h2>
            <form onSubmit={updateBlogPageHandler}>
              <div className="mb-4">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  {...register('title', { required: true })}
                />
              </div>

              {/* Add the description field */}
              <div className="mb-4">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows="3"
                  {...register('description', { required: true })}
                />
              </div>

              {/* Add the meta description field */}
              <div className="mb-4">
                <label htmlFor="metaDescription">Meta Description</label>
                <textarea
                  id="metaDescription"
                  rows="2"
                  {...register('metaDescription', { required: true })}
                />
              </div>
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
                <label htmlFor="imageURL">Image URL</label>
                <input
                  id="imageURL"
                  type="text"
                  value={imageURL}
                  onChange={(e) => setImageURL(e.target.value)}
                  {...register('imageURL', { required: true })}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="altText">Image Alt Text</label>
                <input
                  id="altText"
                  type="text"
                  {...register('altText', { required: true })}
                />
              </div>
              <button type="submit" className="primary-button">
                Update Blog Page
              </button>
            </form>
          </div>
        </div>
        <div className="overflow-x-auto md:col-span-3">
          <div className="justify-between">
            <h2 className="mb-4 text-xl">Blog Posts</h2>
            {loadingDelete && <div>Deleting post...</div>}
            <button
              disabled={loadingCreate}
              onClick={createHandler}
              className="primary-button"
            >
              {loadingCreate ? 'Loading' : 'Create'}
            </button>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="alert-error">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-5 text-left">ID</th>
                    <th className="px-5 text-left">Title</th>
                    <th className="px-5 text-left">Author</th>
                    <th className="px-5 text-left">Created</th>
                    <th className="px-5 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogPosts.map((post) => (
                    <tr key={post._id} className="border-b">
                      <td className="p-5">{post._id.substring(20, 24)}</td>
                      <td className="p-5">{post.title}</td>
                      <td className="p-5">{post.author}</td>
                      <td className="p-5">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-5">
                        <Link href={`/admin/blog/${post._id}`}>
                          <a type="button" className="default-button">
                            Edit
                          </a>
                        </Link>

                        <button
                          onClick={() => deleteHandler(post._id)}
                          className="default-button"
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

AdminBlogScreen.auth = { adminOnly: true };
