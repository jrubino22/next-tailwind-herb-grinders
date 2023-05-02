import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { getError } from '../../../utils/errors';
import { useRouter } from 'next/router';

const AdminIndexFeatured = () => {
  const { register, handleSubmit } = useForm();
  const [images, setImages] = useState([]);

  const router = useRouter()

  useEffect(() => {
    const fetchImages = async () => {
      const { data } = await axios.get('/api/admin/indexFeatured');
      setImages(data);
    };
    fetchImages();
  }, []);

  const onSubmit = async (data, index) => {
    try {
      await axios.put(`/api/admin/indexFeatured/${images[index]._id}`, data);
      setImages((prevImages) => {
        const newImages = [...prevImages];
        newImages[index] = { ...newImages[index], ...data };
        return newImages;
      });
      router.reload()
    } catch (err) {
      console.error(getError(err));
    }
  };

  const uploadHandler = async (e, index) => {
    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
    try {
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

      const updatedImage = { ...images[index], image: data.secure_url };
      setImages((prevImages) => {
        const newImages = [...prevImages];
        newImages[index] = updatedImage;
        return newImages;
      });
    } catch (err) {
      console.error(getError(err));
    }
  };

  return (
    <Layout title="Admin Index Featured">
      <div className="container mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Admin Index Featured</h1>
        <div className="flex">
          <div>
            <ul>
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
                <Link href="/admin/media">
                  <a className="font-bold">Media</a>
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex ml-5">
            <div className="w-4/5 ml-5 flex">
              <div className="w-1/3">
                {images
                  .filter((_, index) => [0, 1, 2].includes(index))
                  .map((image, index) => (
                    <div
                      key={index}
                      className="image-section bg-gray-200 p-4 rounded-md mb-4"
                    >
                      <form
                        onSubmit={handleSubmit((data) => onSubmit(data, index))}
                      >
                        <div className="mb-4">
                          <label htmlFor={`image-${index}`}>Update Image</label>
                          <input
                            id={`image-${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => uploadHandler(e, index)}
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor={`imageURL-${index}`}>Image</label>
                          <img
                            id={`imageURL-${index}`}
                            src={image.image}
                            alt={image.alt}
                            className="object-cover rounded-md border border-gray-300"
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor={`altText-${index}`}>
                            Image Alt Text
                          </label>
                          <input
                            id={`altText-${index}`}
                            type="text"
                            defaultValue={image.alt}
                            {...register(`altText-${index}`)}
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor={`link-${index}`}>Link</label>
                          <input
                            id={`link-${index}`}
                            type="text"
                            defaultValue={image.link}
                            {...register(`link-${index}`)}
                          />
                        </div>
                        <button type="submit" className="primary-button">
                          Update
                        </button>
                      </form>
                    </div>
                  ))}
              </div>
              <div className="w-1/3">
                {images
                  .filter((_, index) => [3, 4].includes(index))
                  .map((image, index) => (
                    <div
                      key={index}
                      className="image-section bg-gray-200 p-4 rounded-md mb-4"
                    >
                      <form
                        onSubmit={handleSubmit((data) => onSubmit(data, index))}
                      >
                        <div className="mb-4">
                          <label htmlFor={`image-${index}`}>Update Image</label>
                          <input
                            id={`image-${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => uploadHandler(e, index)}
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor={`imageURL-${index}`}>Image</label>
                          <img
                            id={`imageURL-${index}`}
                            src={image.image}
                            alt={image.alt}
                            className="object-cover rounded-md border border-gray-300"
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor={`altText-${index}`}>
                            Image Alt Text
                          </label>
                          <input
                            id={`altText-${index}`}
                            type="text"
                            defaultValue={image.alt}
                            {...register(`altText-${index}`)}
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor={`link-${index}`}>Link</label>
                          <input
                            id={`link-${index}`}
                            type="text"
                            defaultValue={image.link}
                            {...register(`link-${index}`)}
                          />
                        </div>
                        <button type="submit" className="primary-button">
                          Update
                        </button>
                      </form>
                    </div>
                  ))}
              </div>
              <div className="w-1/3">
                {images
                  .filter((_, index) => [5, 6, 7].includes(index))
                  .map((image, index) => (
                    <div
                      key={index}
                      className="image-section bg-gray-200 p-4 rounded-md mb-4"
                    >
                      <form
                        onSubmit={handleSubmit((data) => onSubmit(data, index))}
                      >
                        <div className="mb-4">
                          <label htmlFor={`image-${index}`}>Update Image</label>
                          <input
                            id={`image-${index}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => uploadHandler(e, index)}
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor={`imageURL-${index}`}>Image</label>
                          <img
                            id={`imageURL-${index}`}
                            src={image.image}
                            alt={image.alt}
                            className="object-cover rounded-md border border-gray-300"
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor={`altText-${index}`}>
                            Image Alt Text
                          </label>
                          <input
                            id={`altText-${index}`}
                            type="text"
                            defaultValue={image.alt}
                            {...register(`altText-${index}`)}
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor={`link-${index}`}>Link</label>
                          <input
                            id={`link-${index}`}
                            type="text"
                            defaultValue={image.link}
                            {...register(`link-${index}`)}
                          />
                        </div>
                        <button type="submit" className="primary-button">
                          Update
                        </button>
                      </form>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

AdminIndexFeatured.auth = { adminOnly: true };

export default AdminIndexFeatured;
