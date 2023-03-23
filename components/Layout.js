import React, { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ToastContainer } from 'react-toastify';
import { Store } from '../utils/Store';
import { Menu } from '@headlessui/react';
import 'react-toastify/dist/ReactToastify.css';
import { signOut, useSession } from 'next-auth/react';
import DropdownLink from './DropdownLink';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import NavigationMenu from './NavigationLinks';
import MobileNavigationMenu from './MobileNavigationMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

export default function Layout({ title, children }) {
  const { status, data: session } = useSession();

  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    console.log(cart.cartItems);
    setCartItemsCount(cart.cartItems.reduce((a, c) => a + c.quantity, 0));
  }, [cart.cartItems]);

  const logoutClickHandler = () => {
    Cookies.remove('cart');
    dispatch({ type: 'CART_RESET' });
    signOut({ callbackUrl: '/login' });
  };

  const [query, setQuery] = useState('');

  const router = useRouter();
  const submitHandler = (e) => {
    e.preventDefault();
    router.push(`/search?query=${query}`);
  };

  return (
    <>
      <Head>
        <title>
          {title ? title + '- HerbGrinders.com' : 'HerbGrinders.com'}
        </title>
        <meta name="description" content="Herb Grinders" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ToastContainer position="bottom-center" limit={1} />

      <div className="flex min-h-screen flex-col ">
        <header className="bg-white shadow-md">
          <nav className="flex h-12 px-4 justify-between  items-center justify-between">
            {/* Hamburger menu */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {/* Hamburger icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M2 5a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm0 6a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zm1 5a1 1 0 100 2h14a1 1 0 100-2H3z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <Link href="/">
              <a className="text-lg font-bold">HerbGrinders.com</a>
            </Link>
            <form
              onSubmit={submitHandler}
              className="mx-auto hidden w-full justify-center md:flex"
            >
              <input
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                className="rounded-tr-none w-1/2 rounded-br-none p-1 text-sm focus:ring-0"
                placeholder="Search"
              />
              <button
                className="rounded rounded-tl-none rounded-bl-none bg-amber-300 p-1 text-sm dark:text-black"
                type="submit"
                id="button-addon2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </button>
            </form>
            <div>
              <div className="flex items-center">
                <Link href="/cart">
                  <a className="p-2">
                    <FontAwesomeIcon
                      icon={faShoppingCart}
                      className="w-6 h-6"
                    />
                    {cartItemsCount > 0 && (
                      <span className="ml-1 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                        {cartItemsCount}
                      </span>
                    )}
                  </a>
                </Link>
                {status === 'loading' ? (
                  'Loading'
                ) : session?.user ? (
                  <Menu as="div" className="relative profile-menu inline-block">
                    <Menu.Button className="text-blue-600">
                      {session.user.firstName}
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 w-56 origin-top-right bg-white shadow-lg">
                      <Menu.Item>
                        <DropdownLink className="dropdown-link" href="/profile">
                          Profile
                        </DropdownLink>
                      </Menu.Item>
                      <Menu.Item>
                        <DropdownLink
                          className="dropdown-link"
                          href="/order-history"
                        >
                          Order History
                        </DropdownLink>
                      </Menu.Item>
                      {session.user.isAdmin && (
                        <Menu.Item>
                          <DropdownLink
                            className="dropdown-link"
                            href="/admin/dashboard"
                          >
                            Admin Dashboard
                          </DropdownLink>
                        </Menu.Item>
                      )}
                      <Menu.Item>
                        <DropdownLink
                          className="dropdown-link"
                          href="/order-history"
                          onClick={logoutClickHandler}
                        >
                          Logout
                        </DropdownLink>
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                ) : (
                  <Link href="/login">
                    <a className="p-2">
                      <FontAwesomeIcon icon={faSignInAlt} className="w-6 h-6" />
                    </a>
                  </Link>
                )}
              </div>
            </div>
          </nav>
          {/* Mobile search bar */}
          <form
            onSubmit={submitHandler}
            className="mx-auto px-4 w-full justify-center md:hidden"
          >
            <input
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              className="rounded p-1 w-full text-sm focus:ring-0"
              placeholder="Search"
            />
          </form>
        </header>
        <MobileNavigationMenu
          isOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <div className="hidden md:block">
          <NavigationMenu />
        </div>
        <main className="container mt-4 px-4">{children}</main>
        <footer className="flex justify-center items-center shadow-inner">
          <p>Copyright © 2022 herbgrinders.com</p>
        </footer>
      </div>
    </>
  );
}
