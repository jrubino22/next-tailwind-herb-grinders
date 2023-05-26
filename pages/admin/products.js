import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState, useReducer, useRef } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { getError } from '../../utils/errors';
import { debounce } from 'lodash';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, products: action.payload, error: '' };
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

export default function AdminProductsScreen() {
  const router = useRouter();

  const [
    { loading, error, products, loadingCreate, successDelete, loadingDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    products: [],
    error: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState(''); // 'active', 'inactive', or ''
  const [sort, setSort] = useState(''); // 'newest', 'oldest', or ''

  const fileInputRef = useRef(null);

  const handleUploadButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(
        '/api/admin/import-products',
        formData
        // , {
        //   headers: {
        //     'Content-Type': 'multipart/form-data',
        //   },
        // }
      );
      toast.success('Products uploaded successfully');
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const createHandler = async () => {
    if (!window.confirm('Create new product?')) {
      return;
    }
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(`/api/admin/products`);
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Product created successfully');
      router.push(`/admin/product/${data.product._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  const fetchData = async (currentSearchTerm, currentFilter, currentSort) => {
    try {
      dispatch({ type: 'FETCH_REQUEST' });
      const { data } = await axios.get(
        `/api/admin/products?search=${currentSearchTerm}&filter=${currentFilter}&sort=${currentSort}`
      );
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
    }
  };

  const debouncedFetchData = debounce(fetchData, 300);

  useEffect(() => {
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      debouncedFetchData(searchTerm, filter, sort);
    }

    // Cleanup function
    return () => {
      debouncedFetchData.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, successDelete, filter, sort]);

  // Fetch all products when the component is first mounted
  useEffect(() => {
    fetchData('', '', '');
  }, []);

  const deleteHandler = async (productId) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/admin/products/${productId}`);
      dispatch({ type: 'DELETE_SUCCESS' });
      toast.success('Product deleted successfully');
    } catch (err) {
      dispatch({ type: 'DELETE_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title="Admin Products">
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
        <div className="overflow-x-auto md:col-span-3">
          <div className="justify-between">
            <h1 className="mb-4 text-xl">Products</h1>
            {loadingDelete && <div>Deleting item...</div>}
            <button
              disabled={loadingCreate}
              onClick={createHandler}
              className="primary-button mr-5"
            >
              {loadingCreate ? 'Loading' : 'Create'}
            </button>
            <button
              onClick={handleUploadButtonClick}
              className="primary-button ml-5"
            >
              Upload Products
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              hidden
              accept=".csv"
            />
            <select
            className="ml-5"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              className="ml-5"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="">Sort by...</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
            <input
              type="text"
              className="mt-2"
              placeholder="Search..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
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
                    <th className="px-5 text-left">Name</th>
                    <th className="px-5 text-left">Active</th>
                    {/* <th className="px-5 text-left">Category</th> */}
                    <th className="px-5 text-left">Brand</th>
                    {/* <th className="px-5 text-left">Rating</th> */}
                    <th className="px-5 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b">
                      <td className="p-5">{product._id.substring(20, 24)}</td>
                      <td className="p-5">{product.name}</td>
                      <td className="p-5">
                        {product.isActive ? 'Active' : 'Inactive'}
                      </td>
                      {/* <td className="p-5">{product.category}</td> */}
                      <td className="p-5">{product.brand}</td>
                      {/* <td className="p-5">{product.rating}</td> */}
                      <td className="p-5">
                        <Link href={`/admin/product/${product._id}`}>
                          <a type="button" className="default-button">
                            Edit
                          </a>
                        </Link>
                        &nbsp;
                        <button
                          onClick={() => deleteHandler(product._id)}
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

AdminProductsScreen.auth = { adminOnly: true };
