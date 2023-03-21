import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { getError } from '../../utils/errors';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, blogPosts: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
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
    { loading, error, blogPosts, loadingCreate, successDelete, loadingDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    blogPosts: [],
    error: '',
  });

  const createHandler = async () => {
    if (!window.confirm('Create new blog post?')) {
      return;
    }
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(`/api/admin/blog`);
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Blog post created successfully');
      router.push(`/admin/blog/${data.post._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/blog`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [successDelete]);

  const deleteHandler = async (postId) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/admin/blog/${postId}`);
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
          <div className="justify-between">
            <h1 className="mb-4 text-xl">Blog Posts</h1>
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
