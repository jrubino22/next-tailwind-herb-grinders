import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { getError } from '../../../utils/errors';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      console.log('fetchsuccess', action);
      return {
        ...state,
        loading: false,
        product: action.payload,
        error: '',
        images: action.product.images,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'FETCH_REQUEST2':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS2':
      return {
        ...state,
        loading: false,
        subproducts: action.payload,
        error: '',
      };
    case 'FETCH_FAIL2':
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
    case 'SET_DEFAULT_IMAGE':
      return {
        ...state,
        product: {
          ...state.product,
          images: action.image,
        },
      };
    case 'ADD_IMAGE':
      console.log('action.image:', action.image);
      console.log('reducer', state);
      return {
        ...state,
        images: [...(state.images || []), action.image],
      };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };
    default:
      return state;
  }
}

export default function AdminProductEditScreen() {
  const { query } = useRouter();
  const productId = query.id;
  const [
    {
      loading,
      error,
      loadingUpload,
      loadingUpdate,
      product,
      subproducts,
      loadingCreate,
      images,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    subproducts: [],
    error: '',
    images: [],
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const { fields, remove } = useFieldArray({
    control,
    name: 'images',
  });

  const {
    register: register2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2 },
  } = useForm();

  const createHandler = async ({ option, variant }) => {
    if (!window.confirm('Create new variant?')) {
      return;
    }
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(`/api/admin/subproducts`, {
        productId,
        option,
        variant,
      });
      // console.log("data", data)
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Product created successfully');
      console.log('sp', data);
      router.push(`/admin/subproduct/${data.subproduct._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/products/${productId}`);
        console.log('fetchdata', data);
        dispatch({ type: 'FETCH_SUCCESS', product: data });
        setValue('name', data.name);
        setValue('slug', data.slug);
        setValue('price', data.price);
        setValue('category', data.category);
        setValue('brand', data.brand);
        setValue('countInStock', data.countInStock);
        setValue('description', data.description);
        const imageFields = data.images.map((image) => ({
          url: image.url,
          isDefault: image.isDefault,
          altText: image.altText,
        }));
        setValue('images', imageFields);
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
      try {
        dispatch({ type: 'FETCH_REQUEST2' });
        const { data } = await axios.get(
          `/api/admin/subproducts/${productId}`,
          {
            params: {
              productId: productId,
            },
          }
        );
        dispatch({ type: 'FETCH_SUCCESS2', payload: data });
        console.log('sp', data);
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL2', payload: getError(err) });
      }
    };
    fetchData();
  }, [product, productId, setValue]);

  const router = useRouter();

  const uploadHandler = async (e, imageField = 'image') => {
    console.log('uploadhandler0', e);
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

      const newImage = {
        url: data.secure_url,
        isDefault: false,
        altText: '',
      };

      console.log('newImage:', newImage);
      dispatch({ type: 'ADD_IMAGE', image: newImage });

      setValue(imageField, data.secure_url);
      toast.success('File uploaded successfully');
    } catch (err) {
      dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  const submitHandler = async ({
    name,
    slug,
    price,
    category,
    images,
    brand,
    countInStock,
    description,
  }) => {
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(`/api/admin/products/${productId}`, {
        name,
        slug,
        price,
        category,
        images,
        brand,
        countInStock,
        description,
      });
      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title={`Edit Product ${productId}`}>
      <div className="grid md:grid-cols-6 md:gap-5 max-w-screen-xl mx-auto">
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
              <h1 className="mb-4 text-xl">{`Edit Product ${productId}`}</h1>
              <div className="mb-4">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  className="w-full"
                  id="name"
                  autoFocus
                  {...register('name', {
                    required: 'Please enter name',
                  })}
                />
                {errors.name && (
                  <div className="text-red-500">{errors.name.message}</div>
                )}
              </div>{' '}
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
              </div>{' '}
              <div className="mb-4">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  className="w-full"
                  id="category"
                  autoFocus
                  {...register('category', {
                    required: 'Please enter category',
                  })}
                />
                {errors.category && (
                  <div className="text-red-500">{errors.category.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  className="w-full"
                  id="brand"
                  autoFocus
                  {...register('brand', {
                    required: 'Please enter brand',
                  })}
                />
                {errors.brand && (
                  <div className="text-red-500">{errors.brand.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="countInStock">Count in Stock</label>
                <input
                  type="text"
                  className="w-full"
                  id="countInStock"
                  autoFocus
                  {...register('countInStock', {
                    required: 'Please enter count in stock',
                  })}
                />
                {errors.countInStock && (
                  <div className="text-red-500">
                    {errors.countInStock.message}
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="description">description</label>
                <textarea
                  type="text"
                  className="w-full"
                  id="description"
                  autoFocus
                  {...register('description', {
                    required: 'Please enter description',
                  })}
                />
                {errors.description && (
                  <div className="text-red-500">
                    {errors.description.message}
                  </div>
                )}
              </div>
              <div className="rounded-lg bg-blue-100 p-4 mb-5">
                {images.map((image, i) => (
                  <div key={i} className="mb-4 p-4 bg-white rounded-lg">
                    <div className="mb-2">
                      <label
                        htmlFor={`images[${i}].url`}
                        className="block font-medium"
                      >
                        Image {i + 1}
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-2"
                        id={`images[${i}].url`}
                        autoFocus
                        {...register(`images.${i}.url`)}
                        value={image.url}
                        onChange={(e) => {
                          setValue(`images.${i}.url`, e.target.value);
                        }}
                      />
                    </div>
                    <div className="mb-2">
                      {image.url && (
                        <div className="flex items-center justify-center bg-gray-100 p-4 rounded-lg">
                          <img
                            src={image.url}
                            alt={image.altText || 'product image'}
                            className="max-w-full max-h-48"
                          />
                        </div>
                      )}
                    </div>
                    <div className="mb-2">
                      <label
                        htmlFor={`images[${i}].isDefault`}
                        className="block font-medium"
                      >
                        Is Default
                      </label>
                      <input
                        type="checkbox"
                        className="w-full"
                        id={`images[${i}].isDefault`}
                        {...register(`images.${i}.isDefault`)}
                        defaultChecked={image.isDefault}
                        onChange={(e) => {
                          if (e.target.checked) {
                            images.forEach((i) => {
                              if (i !== image) {
                                i.isDefault = false;
                              }
                            });
                          }
                          image.isDefault = e.target.checked;
                          dispatch({ type: 'SET_DEFAULT_IMAGE', image: image });
                        }}
                      />
                    </div>
                    <div className="mb-2">
                      <label
                        htmlFor={`images[${i}].altText`}
                        className="block font-medium"
                      >
                        Alt Text
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg p-2"
                        id={`images[${i}].altText`}
                        {...register(`images.${i}.altText`)}
                        defaultValue={image.altText}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="bg-red-500 text-white py-2 px-4 rounded-lg"
                    >
                      Remove Image
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = 'image/*';
                    fileInput.addEventListener('change', (e) =>
                      uploadHandler(e, `images[${fields.length}].url`)
                    );
                    document.body.appendChild(fileInput);
                    fileInput.click();
                  }}
                  disabled={loadingUpload}
                  className="bg-green-500 text-white py-2 px-4 rounded-lg mt-4 mb-5"
                >
                  {loadingUpload ? 'Uploading...' : 'Add Image'}
                </button>
              </div>
              <div className="mb-4">
                <button disabled={loadingUpdate} className="primary-button">
                  {loadingUpdate ? 'Loading' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
        <div className="md:col-span-2 border-l-2 border-gray-400 pl-4">
          {/* {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="alert-error">{error}</div>
          ) : ( */}
          {subproducts && (
            <>
              <h2 className="mb-4 text-xl">Product Variants</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="px-5 text-left">ID</th>
                      <th className="px-5 text-left">Option</th>
                      <th className="px-5 text-left">Variant</th>
                      <th className="px-5 text-left">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subproducts.map((subproduct) => (
                      <tr key={subproduct._id} className="border-b">
                        <td className="p-5">
                          {subproduct._id.substring(20, 24)}
                        </td>
                        <td className="p-5">{subproduct.option}</td>
                        <td className="p-5">{subproduct.variant}</td>
                        <td className="p-5">${subproduct.price}</td>
                        <td className="p-5">
                          <Link href={`/admin/subproduct/${subproduct._id}`}>
                            <a type="button" className="default-button">
                              Edit
                            </a>
                          </Link>
                          &nbsp;
                          <button
                            // onClick={() => deleteHandler(subproducts._id)}
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
            </>
          )}
          {/* )} */}
          <h2 className="mb-4 mt-4 text-xl">Create Variant</h2>
          <form
            className="fx-auto max-w-screen-md"
            onSubmit={handleSubmit2(createHandler)}
          >
            <div className="mb-4">
              <label htmlFor="option">Option</label>
              <input
                type="text"
                className="w-full"
                id="option"
                autoFocus
                {...register2('option', {
                  required: 'Please enter option',
                })}
              />
              {errors.option && (
                <div className="text-red-500">{errors2.option.message}</div>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="variant">Variant</label>
              <input
                type="text"
                className="w-full"
                id="variant"
                autoFocus
                {...register2('variant', {
                  required: 'Please enter variant',
                })}
              />
              {errors.option && (
                <div className="text-red-500">{errors2.option.message}</div>
              )}
            </div>
            <button disabled={loadingCreate} className="primary-button mb-4">
              {loadingCreate ? 'Loading' : 'Create'}
            </button>
            <div className="mb-4">
              <Link href={`/admin/products`}>Back</Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

AdminProductEditScreen.auth = { adminOnly: true };
