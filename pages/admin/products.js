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
      return { ...state, loading: false, products: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL' :
      return { ...state, loadingCreate: false };
    default:
      state;
  }
}

export default function AdminProductsScreen() {

  const router = useRouter();

  const [{ loading, error, products, loadingCreate, loadingDelete }, dispatch] = useReducer(reducer, {
    loading: true,
    products: [],
    error: '',
  });

  const createHandler = async () => {
    if (!window.confirm('Create new product?')) {
        return;
    }
    try {
      dispatch({ type: 'CREATE_REQUEST' })
      const { data } = await axios.post(`/api/admin/products`);
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Product created successfully');
      router.push(`/admin/product/${data.product._id}`);
    }catch(err){
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err))
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/products`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, []);

  return (
    <Layout title="Admin Products">
      <div className="grid md:grid-cols-4 md:gap-5">
        <div>
          <ul>
            <li>
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link href="/admin/orders">
                Orders
              </Link>
            </li>
            <li>
              <Link href="/admin/products">
                <a className="font-bold">Products</a>
              </Link>
            </li>
            <li>
              <Link href="/admin/users">Users</Link>
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
                                <th className="px-5 text-left">Name</th>
                                <th className="px-5 text-left">Price</th>
                                <th className="px-5 text-left">Category</th>
                                <th className="px-5 text-left">Count</th>
                                <th className="px-5 text-left">Rating</th>
                                <th className="px-5 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id} className="border-b">
                                    <td className="p-5">{product._id.substring(20,24)}</td>
                                    <td className="p-5">{product.name}</td>
                                    <td className="p-5">${product.price}</td>
                                    <td className="p-5">{product.category}</td>
                                    <td className="p-5">{product.countInStock}</td>
                                    <td className="p-5">{product.rating}</td>
                                    <td className="p-5">
                                        <Link href={`/admin/product/${product._id}`}>Edit</Link>
                                        &nbsp;
                                        <button>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )         
        }
        </div>
      </div>
    </Layout>
  );
}

AdminProductsScreen.auth = { adminOnly: true };
