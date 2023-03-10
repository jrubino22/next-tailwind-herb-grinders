import axios from 'axios';
import { signIn, useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { getError } from '../utils/errors';

export default function ProfileScreen() {
  const { data: session } = useSession();

  const {
    handleSubmit,
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    console.log(session.user)
    setValue('firstName', session.user.firstName);
    setValue('lastName', session.user.lastName);
    setValue('email', session.user.email);
    setValue('tel', session.user.phoneNum);
  }, [session.user, setValue]);

  const submitHandler = async ({ firstName, lastName, email, tel, password }) => {
    try {
      await axios.put('/api/auth/update', {
        firstName,
        lastName,
        email,
        tel,
        password,
      });
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      toast.success('Profile Updated Successfully');

      if (result.error) {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error(getError(err));
    }
  };

  return (
    <Layout title="Profile">
      <form
        className="mx-auto max-w-screen-md"
        onSubmit={handleSubmit(submitHandler)}
      >
        <h1 className="mb-4 text-xl">Update Profile</h1>
        <div className="mb-4">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            className="w-full"
            id="name"
            autoFocus
            {...register('firstName', {
              required: 'Please enter first name',
            })}
          />
          {errors.name && (
            <div className="text-red-500">{errors.firstName.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            className="w-full"
            id="lastName"
            autoFocus
            {...register('lastName', {
              required: 'Please enter last name',
            })}
          />
          {errors.name && (
            <div className="text-red-500">{errors.name.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            className="w-full"
            id="email"
            {...register('email', {
              required: 'Please enter email',
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
                message: 'Please enter valid email',
              },
            })}
          />
          {errors.email && (
            <div className="text-red-500">{errors.email.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="tel">Phone</label>
          <input
            type="tel"
            className="w-full"
            id="tel"
            {...register('tel', {
              required: 'Please enter phone number',
              pattern: {
                value:
                  '^s*(?:+?(d{1,3}))?[-. (]*(d{3})[-. )]*(d{3})[-. ]*(d{4})(?: *x(d+))?s*$',
                message: 'Please enter valid phone number',
              },
            })}
          />
          {errors.tel && (
            <div className="text-red-500">{errors.tel.message}</div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="password">Password</label>
          <input
            className="w-full"
            type="password"
            id="password"
            {...register('password', {
              minLength: {
                value: 6,
                message: 'Password must contain 6 or more characters',
              },
            })}
          />
          {errors.password && (
            <div className="text-red-500">{errors.password.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword">ConfirmPassword</label>
          <input
            className="w-full"
            type="password"
            id="confirmPassword"
            {...register('confirmPassword', {
              validate: (value) => value === getValues('password'),
              minLength: {
                value: 6,
                message: 'Password must contain 6 or more characters',
              },
            })}
          />
          {errors.confirmPassword && (
            <div className="text-red-500">{errors.confirmPassword.message}</div>
          )}
          {errors.confirmPassword &&
            errors.confirmPassword.type === 'validate' && (
              <div className="text-red-500">Passwords do not match</div>
            )}
        </div>
        <div className="mb-4">
          <button className="primary-button">Update Profile</button>
        </div>
      </form>
    </Layout>
  );
}

ProfileScreen.auth = true;
