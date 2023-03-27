import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { getError } from '../../../utils/errors';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_CATEGORIES_SUCCESS':
      return {
        ...state,
        loading: false,
        categories: action.payload,
        error: '',
      };
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
        name: action.product.name,
        slug: action.product.slug,
        description: action.product.description,
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
    case 'SET_ALT_TEXT': {
      const { url, altText } = action.payload;
      const imagesArray = [...state.images];
      const imageIndex = imagesArray.findIndex((image) => image.url === url);
      if (imageIndex !== -1) {
        imagesArray[imageIndex] = {
          ...imagesArray[imageIndex],
          altText,
        };
      }
      return {
        ...state,
        images: imagesArray,
      };
    }

    case 'ADD_IMAGE':
      console.log('action.image:', action.image);
      console.log('reducer', state);
      return {
        ...state,
        images: [...(state.images || []), action.image],
      };
    case 'REORDER_IMAGES': {
      const newImages = Array.from(state.images);
      const [removedImage] = newImages.splice(action.startIndex, 1);
      newImages.splice(action.endIndex, 0, removedImage);

      const updatedImages = newImages.map((image, index) => {
        return { ...image, displayOrder: index + 1 };
      });
      console.log('updatedImg', updatedImages);
      return { ...state, images: updatedImages };
    }
    // case 'REMOVE_IMAGE':{
    //   console.log('removeimg', action.payload)
    //   return {
    //     ...state,
    //     images: state.images.filter(image  => image.url !== action.payload)
    //   };
    // }
    case 'REMOVE_IMAGE': {
      console.log('removeimg', action.payload);
      const imagesArray = [...state.images];
      imagesArray.splice(action.payload, 1);
      return {
        ...state,
        images: imagesArray,
      };
    }
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
      subproducts,
      loadingCreate,
      images,
      name,
      slug,
      description,
      categories,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    subproducts: [],
    error: '',
    images: [],
    categories: [],
  });

  console.log('desc', description);

  const [prettyDescription, setPrettyDescription] = useState('');

  const handleEditorChange = (value) => {
    setPrettyDescription(value);
  };

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const { fields } = useFieldArray({
    control,
    name: 'images',
  });

  const {
    register: register2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2 },
  } = useForm();

  const createHandler = async ({ variant }) => {
    if (!window.confirm('Create new variant?')) {
      return;
    }
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(`/api/admin/subproducts`, {
        productId,
        parentName: name,
        slug,
        variant,
        imageURL: images[0].url,
        imageAlt: images[0].altText,
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

  const editAltText = (url, altText) => {
    dispatch({ type: 'SET_ALT_TEXT', payload: { url, altText } });
  };

  useEffect(() => {
    setPrettyDescription(description);
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/products/${productId}`);
        console.log('fetchdata', data);
        dispatch({ type: 'FETCH_SUCCESS', product: data });
        setValue('name', data.name);
        setValue('slug', data.slug);
        setValue('price', data.price);
        setValue('category', data.category)
        
        setValue('brand', data.brand);
        setValue('countInStock', data.countInStock);
        // setValue('description', data.description);
        const imageFields = data.images.map((image) => ({
          url: image.url,
          altText: image.altText,
          displayOrder: image.displayOrder,
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
      try {
        dispatch({ type: 'FETCH_CATEGORIES_REQUEST' });
        const { data } = await axios.get('/api/admin/categories');
        dispatch({ type: 'FETCH_CATEGORIES_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_CATEGORIES_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [productId, setValue, description]);

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
        altText: '',
        displayOrder: (await images.length) + 1,
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

  const removeImage = (i) => {
    try {
      dispatch({ type: 'REMOVE_IMAGE', payload: i });
      console.log('remove img func', images);
      toast.success('Image Removed');
    } catch {
      toast.error('Unable to remove image');
    }
  };

  const getTheState = () => {
    console.log('getTheState');
  };

  const submitHandler = async ({
    name,
    slug,
    price,
    category,
    brand,
    countInStock,
  }) => {
    try {
      console.log('put images2', images[0].altText);
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(`/api/admin/products/${productId}`, {
        name,
        slug,
        price,
        category,
        images,
        brand,
        countInStock,
        prettyDescription,
      });
      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('Product updated successfully');
      window.location.reload();
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
            <li>
              <button onClick={() => getTheState()}>state</button>
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
                <label htmlFor="slug">URL Slug</label>
                <input
                  type="text"
                  className="w-full"
                  id="slug"
                  autoFocus
                  {...register('slug', {
                    required: 'Please enter slug',
                  })}
                />
                {errors.slug && (
                  <div className="text-red-500">{errors.slug.message}</div>
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
                <select
                  className="w-full"
                  id="category"
                  {...register('category', {
                    required: 'Please select a category',
                  })}
                  // defaultValue={currentCategory.toString()}
                >
                  <option value="">Select a category...</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.title}
                    </option>
                  ))}
                </select>
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
                <SimpleMDE
                  value={prettyDescription}
                  onChange={(value) => handleEditorChange(value)}
                />
                {errors.description && (
                  <div className="text-red-500">
                    {errors.description.message}
                  </div>
                )}
              </div>
              <div className="rounded-lg bg-blue-100 p-4 mb-5">
                <DragDropContext
                  onDragEnd={(result) => {
                    if (!result.destination) {
                      return;
                    }
                    const startIndex = result.source.index;
                    const endIndex = result.destination.index;

                    dispatch({
                      type: 'REORDER_IMAGES',
                      startIndex,
                      endIndex,
                    });
                  }}
                >
                  <Droppable droppableId="images">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {images.map((image, i) => (
                          <Draggable
                            key={i}
                            draggableId={`image-${i}`}
                            index={i}
                          >
                            {(provided) => (
                              <div
                                key={i}
                                id={`image-${i}`}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-4 p-4 bg-white rounded-lg"
                              >
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
                                      setValue(
                                        `images.${i}.url`,
                                        e.target.value
                                      );
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
                                {image.displayOrder === 1 && (
                                  <div className="mb-2">Default Image</div>
                                )}
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
                                    onChange={(e) =>
                                      editAltText(image.url, e.target.value)
                                    }
                                    value={image.altText}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeImage(i)}
                                  className="bg-red-500 text-white py-2 px-4 rounded-lg"
                                >
                                  Remove Image
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
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
                      <th className="px-5 text-left">Variant</th>
                      <th className="px-5 text-left">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subproducts.map((subproduct) => (
                      <tr key={subproduct._id} className="border-b">
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
              <label htmlFor="variant">Variant Description</label>
              <input
                type="text"
                className="w-full"
                id="variant"
                placeholder="size and/or color"
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
