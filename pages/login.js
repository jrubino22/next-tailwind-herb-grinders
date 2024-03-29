import Link from 'next/link';
import React, { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import Layout from '../components/Layout';
import { getError } from '../utils/errors';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

export default function LoginScreen() {
  const { data: session } = useSession();

  const router = useRouter();
  const { redirect } = router.query;

  useEffect(() => {
    if (session?.user) {
      router.push(redirect || '/');
    }
  }, [router, session, redirect]);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  const submitHandler = async ({ email, password }) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (result.error) {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error(getError(err));
    }
  };

  const guestCheckout = () => {
    const guestSessionId = uuidv4();
    Cookies.set('guestSessionId', guestSessionId, { expires: 1 });
    router.push('/guest-checkout');
  };

  return (
    <Layout title="login">
      <form
        className="mx-auto max-w-screen-md"
        onSubmit={handleSubmit(submitHandler)}
      >
        <h1 className="mb-4 text-xl">Login</h1>
        <div className="mb-4">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            {...register('email', {
              required: 'Please enter email',
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
                message: 'Please enter valid email',
              },
            })}
            className="w-full"
            id="email"
            autoFocus
          ></input>
          {errors.email && (
            <div className="text-red-500">{errors.email.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            {...register('password', {
              required: 'Please enter password',
              minLength: {
                value: 6,
                message: 'password must be more than 5 characters',
              },
            })}
            className="w-full"
            id="password"
            autoFocus
          ></input>
          {errors.password && (
            <div className="text-red-500">{errors.password.message}</div>
          )}
        </div>
        <div className="mb-4">
          <button className="primary-button" aria-label="login">
            Login
          </button>
        </div>
        <div className="mb-4 ">
          Don&apos;t have an account? &nbsp;
          <Link
            href={
              router.query.checkout ? '/register?checkout=true' : '/register'
            }
          >
            Register
          </Link>
        </div>
      </form>
      {router.query.checkout && (
        <>
          <hr></hr>
          <div className="mt-4 mb-4 text-center">
            <p className="text-bold text-center">Or</p>
            <button
              onClick={() => guestCheckout()}
              className="primary-button guest-button w-full md:w-2/5 mx-auto"
              aria-label="continue-as-guest"
            >
              Continue as Guest
            </button>
          </div>
        </>
      )}
    </Layout>
  );
}
