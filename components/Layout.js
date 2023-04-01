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
import {
  faShoppingCart,
  faUser,
  faSearch,
  faBars,
} from '@fortawesome/free-solid-svg-icons';
// import Image from 'next/image';

export default function Layout({
  title,
  metaDesc,
  children,
  applyMarginPadding = true,
}) {
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
        <meta
          name="description"
          content={
            metaDesc
              ? metaDesc
              : 'Find the perfect herb or weed grinder for your smoking needs at HerbGrinders.com. Our vast selection includes everything from sleek and stylish to practical and durable grinders. Browse our collection of high-quality herb grinders and weed grinders today.'
          }
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ToastContainer position="bottom-center" limit={1} />

      <div className="flex min-h-screen flex-col bg-white">
        <header className="header-bg shadow-md">
          <nav className="container mx-auto flex h-16 px-4 justify-between items-center">
            {/* Hamburger menu */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {/* Hamburger icon */}
              <FontAwesomeIcon icon={faBars} className="w-6 h-6 text-white" />
            </button>
            <Link href="/">
              <a className="text-2xl font-bold header-text-color ml-5">
                HerbGrinders.com
                {/* <Image src="https://res.cloudinary.com/ddsp9kgde/image/upload/v1679710428/zodiac_oasis_logo_blue_horizontal_emoedp.png" alt="" height="90" width="280" /> */}
              </a>
            </Link>
            <form
              onSubmit={submitHandler}
              className="mx-auto hidden w-1/2 justify-center md:flex flex-grow search-bar-bg rounded mx-5"
            >
              <input
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                className="search-input rounded-l p-2 text-sm focus:ring-0 border border-gray-300"
                placeholder="Search"
              />
              <button
                className="rounded-r bg-green-500 p-2 text-sm text-white border border-green-600"
                type="submit"
                id="button-addon2"
              >
                <FontAwesomeIcon icon={faSearch} className="w-6 h-6" />
              </button>
            </form>
            <div>
              <div className="flex items-center md:mr-5">
                <Link href="/cart">
                  <a className="p-2 md:mr-2">
                    {cartItemsCount > 0 && (
                      <span className="ml-1 rounded-full bg-green-500 px-2 py-1 text-xs font-bold text-black">
                        {cartItemsCount}
                      </span>
                    )}
                    <FontAwesomeIcon
                      icon={faShoppingCart}
                      className="w-6 h-6 text-white"
                    />
                  </a>
                </Link>
                {status === 'loading' ? (
                  'Loading'
                ) : session?.user ? (
                  <Menu as="div" className="relative profile-menu inline-block">
                    <Menu.Button className="header-text-color">
                      {session.user.firstName}
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 w-56 origin-top-right bg-white shadow-lg rounded">
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
                      <FontAwesomeIcon
                        icon={faUser}
                        className="w-6 h-6 text-white"
                      />
                    </a>
                  </Link>
                )}
              </div>
            </div>
          </nav>
          {/* Mobile search bar */}
          <form
            onSubmit={submitHandler}
            className="mx-auto px-4 mb-4  mr-5 w-full justify-center  md:hidden"
          >
            <div className="flex">
              <input
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                className="rounded-l p-2 w-full text-sm focus:ring0 border border-gray-300"
                placeholder="Search"
              />
              <button
                className="rounded-r bg-blue-600 p-2 text-sm text-white border border-blue-600"
                type="submit"
                id="button-addon2"
              >
                <FontAwesomeIcon icon={faSearch} className="w-6 h-6" />
              </button>
            </div>
          </form>
        </header>
        <MobileNavigationMenu
          isOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <div className="hidden md:block">
          <NavigationMenu />
        </div>
        <main className={`container${applyMarginPadding ? ' my-4 px-4' : ''}`}>
          {children}
        </main>
        <footer className="flex justify-center items-center shadow-inner mt-4 py-4 bg-white">
          <p className="text-sm text-gray-600">
            Copyright © 2023 herbgrinders.com
          </p>
        </footer>
      </div>
    </>
  );
}
