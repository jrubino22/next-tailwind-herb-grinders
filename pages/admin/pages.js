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
      return { ...state, loading: false, pages: action.payload, error: '' };
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

export default function AdminPageScreen() {
  const router = useRouter();

  const [{loading, error, pages, successDelete, loadingDelete, loadingCreate }, dispatch] = useReducer(reducer, {
    loading: true,
    pages: [],
    error: '',
  });

  const createHandler = async () => {
    if (!window.confirm('Create new page?')) {
      return;
    }
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(`/api/admin/pages`);
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Page created successfully');
      router.push(`/admin/pages/${data._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/pages`);
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
  }, [successDelete]);

  const deleteHandler = async (pageId) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/admin/pages/${pageId}`);
      dispatch({ type: 'DELETE_SUCCESS' });
      toast.success('Page deleted successfully');
    } catch (err) {
      dispatch({ type: 'DELETE_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title="Admin Page Screen">
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
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="alert-error">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="justify-between">
              <h2 className="mb-4 text-xl">Pages</h2>
              {loadingDelete && <div>Deleting page...</div>}
              <button
                disabled={loadingCreate}
                onClick={createHandler}
                className="primary-button"
              >
                {loadingCreate ? 'Loading' : 'Create'}
              </button>
            </div>
            <table className="min-w-full">
              <thead className="border-b">
                <tr>
                  <th className="px-5 text-left">Title</th>
                  <th className="px-5 text-left">Active</th>
                  <th className="px-5 text-left">Date Created</th>
                </tr>
              </thead>
              <tbody>
                { pages.map((page) => (
                      <tr key={page._id} className="border-b">
                        <td className="p-5">{page.title}</td>
                        <td className="p-5">{page.isActive ? 'Yes' : 'No'}</td>
                        <td className="p-5">
                          {new Date(page.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-5">
                          <Link href={`/admin/pages/${page._id}`}>
                            <a type="button" className="default-button">
                              Edit
                            </a>
                          </Link>

                          <button
                            onClick={() => deleteHandler(page._id)}
                            className="default-button"
                            type="button"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

AdminPageScreen.auth = { adminOnly: true };
