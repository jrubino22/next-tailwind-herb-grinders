import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

export default function RegisterScreen() {
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm();

  const [loading, setLoading] = useState(false);

  const password = watch('password');

  const onSubmit = async (formData) => {
    const data = {
        ...formData,
        registeredUser: true,
    }
    try {
      setLoading(true);
      try {
        setLoading(true);
        const response = await fetch('/api/auth/registerUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        setLoading(false);
        if (response.ok) {
        router.push('/login');
        toast.success('Registration successful');
        }
      } catch (err) {
        setLoading(false);
        toast.error(err.response.data.message);
      }
      toast.success('Registration successful');
    } catch (err) {
      setLoading(false);
      toast.error(err.response.data.message);
    }
  };

  return (
    <Layout title="Register">
      <div className="mx-auto max-w-screen-md">
        <h1 className="mb-4 text-xl">Register</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              {...register('firstName', {
                required: 'Please enter your first name',
                maxLength: {
                  value: 50,
                  message: 'Name must be less than 50 characters',
                },
              })}
              className="w-full"
            />
            {errors.firstName && (
              <div className="text-red-500">{errors.firstName.message}</div>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              {...register('lastName', {
                required: 'Please enter your last name',
                maxLength: {
                  value: 50,
                  message: 'last name must be less than 50 characters',
                },
              })}
              className="w-full"
            />
            {errors.name && (
              <div className="text-red-500">{errors.lastName.message}</div>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: 'Please enter your email',
                pattern: {
                  value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
                  message: 'Please enter a valid email',
                },
              })}
              className="w-full"
            />
            {errors.email && (
              <div className="text-red-500">{errors.email.message}</div>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="phoneNum">Phone Number</label>
            <input
              type="text"
              id="phoneNum"
              {...register('phoneNum', {
                required: 'Please enter your phone number',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Please enter a valid phone number',
                },
              })}
              className="w-full"
            />
            {errors.phoneNum && (
              <div className="text-red-500">{errors.phoneNum.message}</div>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              {...register('password', {
                required: 'Please enter a password',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters long',
                },
              })}
              className="w-full"
            />
            {errors.password && (
              <div className="text-red-500">{errors.password.message}</div>
            )}
          </div>{' '}
          <div className="mb-4">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match',
              })}
              className="w-full"
            />
            {errors.confirmPassword && (
              <div className="text-red-500">
                {errors.confirmPassword.message}
              </div>
            )}
          </div>
          <div className="mb-4">
            <button className="register-submit primary-button" disabled={loading} type="submit">
              Register
            </button>
          </div>
          <div className="mb-4">
            Already have an account? &nbsp;
            <Link href="/login">
              <a className="text-blue-500 hover:underline">Login</a>
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
