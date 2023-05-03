import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer, useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { getError } from '../../../utils/errors';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import WeightInputComponent from '../../../components/WeightInputComponent';
import DynamicSimpleMDE from '../../../components/DynamicSimpleMDE';
import 'easymde/dist/easymde.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

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
      return { ...state, images: updatedImages };
    }
    case 'REMOVE_IMAGE': {
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
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
}

export default function AdminProductEditScreen() {
  const { query } = useRouter();
  const router = useRouter();
  const productId = query.id;
  const [
    {
      loading,
      error,
      loadingUpload,
      loadingUpdate,
      subproducts,
      // loadingCreate,
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

  const [prettyDescription, setPrettyDescription] = useState('');
  const [prettyFeatures, setPrettyFeatures] = useState('');
  const [productWeight, setProductWeight] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [options, setOptions] = useState([]);
  const [optionValues, setOptionValues] = useState([]);
  const [variants, setVariants] = useState([]);
  const [showAddOptionInput, setShowAddOptionInput] = useState(false);
  const [recentAddedOptionValue, setRecentAddedOptionValue] = useState(null);
  const [shouldRegenerateVariants, setShouldRegenerateVariants] =
    useState(false);

  useEffect(() => {
    const allOptionsHaveValues = optionValues.every(
      (option) => option.values.length > 0
    );

    if (
      allOptionsHaveValues &&
      recentAddedOptionValue &&
      shouldRegenerateVariants
    ) {
      generateVariants(recentAddedOptionValue);
      setShouldRegenerateVariants(false);
    }
  }, [
    generateVariants,
    optionValues,
    recentAddedOptionValue,
    shouldRegenerateVariants,
  ]);

  const addOption = (option) => {
    if (options.length < 3) {
      setOptions([...options, option]);
      setOptionValues([...optionValues, { name: option, values: [] }]);
    }
  };

  const addOptionValue = (optionName, optionValue) => {
    setShouldRegenerateVariants(true);
    setOptionValues(
      optionValues.map((option) =>
        option.name === optionName
          ? { ...option, values: [...option.values, optionValue] }
          : option
      )
    );
    generateVariants(optionName, optionValue);
  };

  const handleAddValueBlur = (optionName, inputValue) => {
    if (inputValue) {
      addOptionValue(optionName, inputValue);
      setRecentAddedOptionValue({ optionName, optionValue: inputValue });
    }
  };

  const generateVariants = useCallback(
    (recentAddedOptionValue) => {
      const newVariants = [];
      const generateCombinations = (current, rest) => {
        if (!rest.length) {
          newVariants.push(current);
          return;
        }
        rest[0].values.forEach((value) =>
          generateCombinations(
            [...current, { name: rest[0].name, value }],
            rest.slice(1)
          )
        );
      };

      generateCombinations([], optionValues);

      const updatedVariants = [];

      // Identify if the added value is the first one for that option
      const isNewValue =
        recentAddedOptionValue &&
        optionValues.find(
          (option) =>
            option.name === recentAddedOptionValue.optionName &&
            option.values.length === 1
        );

      // Update existing variants with new options
      if (isNewValue) {
        variants.forEach((variant) => {
          const updatedVariant = {
            ...variant,
            _id: variant._id,
            options: [
              ...variant.options,
              {
                name: recentAddedOptionValue.optionName,
                value: recentAddedOptionValue.optionValue,
              },
            ],
          };
          updatedVariants.push(updatedVariant);
        });
      } else {
        updatedVariants.push(...variants);
      }

      // Add new variants
      newVariants.forEach((newVariant) => {
        const exists = updatedVariants.find((updatedVariant) =>
          updatedVariant.options.every(
            (option, index) =>
              option.name === newVariant[index].name &&
              option.value === newVariant[index].value
          )
        );

        if (!exists) {
          updatedVariants.push({ options: newVariant });
        }
      });

      setVariants(updatedVariants);
    },
    [optionValues, variants]
  );

  const deleteOptionValue = async (optionName, optionValue) => {
    setShouldRegenerateVariants(false);

    let updatedOptionValues = optionValues.map((option) =>
      option.name === optionName
        ? {
            ...option,
            values: option.values.filter((value) => value !== optionValue),
          }
        : option
    );

    // Check the conditions and update the optionValues and variants accordingly
    const option = updatedOptionValues.find(
      (option) => option.name === optionName
    );

    if (option.values.length === 0) {
      updatedOptionValues = updatedOptionValues.filter(
        (option) => option.name !== optionName
      );

      if (updatedOptionValues.length === 0) {
        // Condition 3: No option objects left, delete all variants
        setVariants([]);
      } else {
        // Condition 2: Delete optionName-value pair from variants
        setVariants(
          variants.map((variant) => ({
            ...variant,
            options: variant.options.filter(
              (option) => option.name !== optionName
            ),
          }))
        );
      }
    } else {
      // Condition 1: Delete variants that have the optionName-value pair
      setVariants(
        variants.filter(
          (variant) =>
            !variant.options.some(
              (option) =>
                option.name === optionName && option.value === optionValue
            )
        )
      );
    }
    // Update the optionValues state
    setOptionValues(updatedOptionValues);
  };

  const handleWeightChange = (value) => {
    setProductWeight(value);
  };

  const handleEditorChange = (value) => {
    setPrettyDescription(value);
  };
  const handleEditorChange2 = (value) => {
    setPrettyFeatures(value);
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

  const updateVariants = async () => {
    const existingVariants = variants
      .filter((variant) => variant._id)
      .map((variant) => {
        const selectedOptions = optionValues.map((option) => {
          const value = variant.options.find(
            (v) => v.name === option.name
          )?.value;
          return { name: option.name, value: value || '' };
        });

        return { _id: variant._id, selectedOptions };
      });
    await axios.put(`/api/admin/subproducts`, {
      subproducts: existingVariants,
    });
    const newVariants = variants
      .map((variant) => {
        const variantName = variant.options
          .map((option) => option.value)
          .join(', ');
        const imageUrl = images[0].url ? images[0].url : '';
        const imageAlt = images[0].altText ? images[0].altText : '';
        const parentName = name;
        // Generate selectedOptions for new and existing products
        const selectedOptions = optionValues.map((option) => {
          const value = variant.options.find(
            (v) => v.name === option.name
          )?.value;
          return { name: option.name, value: value || '' };
        });

        return {
          ...variant,
          variant: variantName,
          imageUrl,
          imageAlt,
          parentName,
          slug,
          selectedOptions,
        };
      })
      .filter((variant) => !variant._id);
    const deletedVariantIds = Array.isArray(subproducts)
      ? subproducts
          .filter(
            (subproduct) =>
              !variants.find((variant) => variant._id === subproduct._id)
          )
          .map((subproduct) => subproduct._id)
      : [];
    try {
      const { data } = await axios.post('/api/admin/subproducts', {
        productId,
        newVariants,
        deletedVariantIds,
        options: optionValues,
      });
      toast.success('variants updated successfully');
      console.log('Variants updated successfully', data);
      router.reload();
    } catch (err) {
      toast.error(getError(err));
      console.error('Error updating variants', error);
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
        setValue('brand', data.brand);
        setValue('price', data.price);
        setValue('sku', data.sku);
        setValue('metaDesc', data.metaDesc);
        setValue('isActive', data.isActive);
        setValue('productTags', data.tags.join(', '));
        setValue('countInStock', data.countInStock);
        setSelectedCategory(data.category);
        const imageFields = data.images.map((image) => ({
          url: image.url,
          altText: image.altText,
          displayOrder: image.displayOrder,
        }));
        setValue('images', imageFields);
        setPrettyFeatures(data.features);
        setOptions(data.options.map((option) => option.name));
        setOptionValues(data.options);
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

        const initialVariants = data.map((subproduct) => {
          const variantOptions = subproduct.selectedOptions.map((option) => ({
            name: option.name,
            value: option.value,
          }));

          return {
            options: variantOptions,
            _id: subproduct._id,
          };
        });

        setVariants(initialVariants);
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


  const removeImage = (i) => {
    try {
      dispatch({ type: 'REMOVE_IMAGE', payload: i });
      toast.success('Image Removed');
    } catch {
      toast.error('Unable to remove image');
    }
  };

  const getTheState = () => {
    console.log('gts', variants);
  };

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

      const newImage = {
        url: data.secure_url,
        altText: '',
        displayOrder: (await images.length) + 1,
      };
      dispatch({ type: 'ADD_IMAGE', image: newImage });

      setValue(imageField, data.secure_url);
      toast.success('File uploaded successfully');
    } catch (err) {
      dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  const submitHandler = async ({
    isActive,
    name,
    slug,
    sku,
    price,

    brand,
    metaDesc,
    countInStock,
    productTags,
  }) => {
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(`/api/admin/products/${productId}`, {
        isActive,
        name,
        slug,
        price,
        sku,
        metaDesc,
        category: selectedCategory === '' ? null : selectedCategory,
        images,
        brand,
        productTags: productTags.split(',').map((tag) => tag.trim()),
        countInStock,
        productWeight,
        prettyDescription,
        prettyFeatures,
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
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  className="w-full"
                  id="name"
                  name="name"
                  {...register('name', {
                    required: 'Please enter name',
                  })}
                />
                {errors.name && (
                  <div className="text-red-500">{errors.name.message}</div>
                )}
              </div>{' '}
              {subproducts.length < 1 && (
                <div className="mb-4">
                  <label htmlFor="price">Price</label>
                  <input
                    type="text"
                    className="w-full"
                    name="price"
                    id="price"
                    s
                    {...register('price', {
                      required: 'Please enter price',
                    })}
                  />
                  {errors.price && (
                    <div className="text-red-500">{errors.price.message}</div>
                  )}
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="category">Category</label>
                <select
                  className="w-full"
                  id="category"
                  value={selectedCategory}
                  {...register('category')}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select a category...</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="brand">Brand</label>
                <input
                  type="text"
                  className="w-full"
                  name="brand"
                  id="brand"
                  s
                  {...register('brand')}
                />
              </div>
              {subproducts.length < 1 && (
                <>
                  <div className="mb-4">
                    <label htmlFor="countInStock">Count in Stock</label>
                    <input
                      type="text"
                      className="w-full"
                      id="countInStock"
                      name="countInStock"
                      s
                      {...register('countInStock')}
                    />
                  </div>

                  <WeightInputComponent
                    id="weight"
                    name="weight"
                    onChange={handleWeightChange}
                    initialWeightInGrams={productWeight}
                  />

                  <div className="mb-4">
                    <label htmlFor="sku">SKU</label>
                    <input
                      type="text"
                      className="w-full"
                      name="sku"
                      id="sku"
                      s
                      {...register('sku')}
                    />
                  </div>
                </>
              )}
              <div className="mb-4">
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
              <div className="mb-4">
                <label htmlFor="features">features</label>
                <DynamicSimpleMDE
                  value={prettyFeatures}
                  onChange={(value) => handleEditorChange2(value)}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description">description</label>
                <DynamicSimpleMDE
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
                                    s
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
                <label htmlFor="slug">URL Slug</label>
                <input
                  type="text"
                  className="w-full"
                  id="slug"
                  s
                  {...register('slug', {
                    required: 'Please enter slug',
                  })}
                />
                {errors.slug && (
                  <div className="text-red-500">{errors.slug.message}</div>
                )}
              </div>{' '}
              <div className="mb-4">
                <label htmlFor="metaDesc">Meta Description</label>
                <textarea
                  type="text"
                  className="w-full"
                  id="metaDesc"
                  s
                  {...register('metaDesc')}
                />
              </div>{' '}
              <div className="mb-4">
                <button disabled={loadingUpdate} className="primary-button">
                  {loadingUpdate ? 'Loading' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
        <>
          <form className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Options</h2>
              {options.map((option, index) => {
                const optionObj = optionValues.find(
                  (opt) => opt.name === option
                );
                return (
                  <div key={index} className="mb-4">
                    <h3 className="text-lg font-semibold">{option}</h3>
                    {optionObj && (
                      <ul className="list-disc pl-8">
                        {optionObj.values.map((value, i) => (
                          <li key={i} className="flex items-center">
                            {value}
                            <span
                              className="ml-2 cursor-pointer"
                              onClick={() => deleteOptionValue(option, value)}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <input
                      type="text"
                      className="border border-gray-300 p-2"
                      placeholder="Add value"
                      onBlur={(e) => {
                        handleAddValueBlur(option, e.target.value);
                        e.target.value = '';
                      }}
                    />
                  </div>
                );
              })}
              {!showAddOptionInput && options.length < 3 && (
                <button
                  className="border border-gray-300 p-2"
                  onClick={() => setShowAddOptionInput(true)}
                >
                  Add Option
                </button>
              )}
              {showAddOptionInput && (
                <input
                  type="text"
                  className="border border-gray-300 p-2"
                  placeholder="Add option"
                  onBlur={(e) => {
                    if (e.target.value) addOption(e.target.value);
                    e.target.value = '';
                  }}
                />
              )}
            </div>
          </form>
          <div>
            <h2 className="text-xl font-bold mb-4">Variants</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Variant</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">
                      {variant.options
                        ? variant.options
                            .map((option) => `${option.name}: ${option.value}`)
                            .join(', ')
                        : 'no options'}
                    </td>
                    {variant._id && (
                      <td className="p-2">
                        <Link href={`/admin/subproduct/${variant._id}`}>
                          <a>
                            <button>Edit</button>
                          </a>
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <div>
              <button
                onClick={updateVariants}
                disabled={loadingUpdate}
                className="mt-5 primary-button"
              >
                {loadingUpdate ? 'Loading' : 'Update Variants'}
              </button>
            </div>
          </div>
        </>
      </div>
    </Layout>
  );
}

AdminProductEditScreen.auth = { adminOnly: true };
