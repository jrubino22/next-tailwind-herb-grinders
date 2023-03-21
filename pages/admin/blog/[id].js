import { useRouter } from 'next/router';
import React, { useEffect, useReducer, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import SimpleMDE from 'react-simplemde-editor';
import axios from 'axios';
import Layout from '../../../components/Layout';
import { getError } from '../../../utils/errors';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
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

export default function AdminBlogEditScreen() {
  const { query } = useRouter();
  const blogId = query.id;
  const [{ loading, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const {
    handleSubmit,
    setValue,
    
  } = useForm();

  const [content, setContent] = useState('');

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/blog/${blogId}`);
        dispatch({ type: 'FETCH_SUCCESS' });
        setValue('title', data.title);
        setValue('slug', data.slug);
        setValue('subtitle', data.subtitle);
        setValue('author', data.author);
        setValue('metaDesc', data.metaDesc);
        setValue('image', data.image.url);
        setValue('altText', data.image.altText);
        setContent(data.content);
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    fetchBlogPost();
  }, [blogId, setValue]);

  const submitHandler = async ({
    title,
    slug,
    subtitle,
    author,
    metaDesc,
    image,
    altText,
  }) => {
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(`/api/admin/blog/${blogId}`, {
        title,
        slug,
        subtitle,
        author,
        content,
        metaDesc,
        image: { url: image, altText },
      });
      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('Blog post updated successfully');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title={`Edit Blog Post: ${blogId}`}>
      <div className="grid md:grid-cols-4 md:gap-5">
        <div>
          {/* Add your navigation menu here */}
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
                  <h1 className="mb-4 text-xl">{`Edit Blog Post: ${blogId}`}</h1>
                  {/* Add other form fields here */}
    
                  <div className="mb-4">
                    <label htmlFor="content">Content</label>
                    <SimpleMDE
                      id="content"
                      value={content}
                      onChange={(value) => setContent(value)}
                      options={{
                        minHeight: '200px',
                        toolbar: [
                          'bold',
                          'italic',
                          'strikethrough',
                          'heading',
                          '|',
                          'code',
                          'quote',
                          'unordered-list',
                          'ordered-list',
                          '|',
                          'link',
                          'image',
                          '|',
                          'preview',
                          'side-by-side',
                          'fullscreen',
                          '|',
                          'guide',
                        ],
                      }}
                    />
                  </div>
                  <div className="mb-4">
                    <button className="primary-button">
                      Update
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Layout>
      );
    }
    
    AdminBlogEditScreen.auth = { adminOnly: true };