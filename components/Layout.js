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

      <div className="bg-yellow-400 text-center ">
        <span className="color-pal-2 text-sm">
          Grand Opening Sale! 20% off will be applied at checkout
        </span>
      </div>
      <div className="flex flex-col bg-white csticky z-10">
        <header className="header-bg shadow-md">
          <nav className="container mx-auto flex h-16 px-4 md:px-8 lg:px-32 2xl:px-64 bg-gray-900 justify-between items-center">
            {/* Hamburger menu */}
            <button
              aria-label="mobile menu"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {/* Hamburger icon */}
              <FontAwesomeIcon
                icon={faBars}
                className="w-5 h-5 text-white hover:text-gray-400 transition-colors"
              />
            </button>
            <Link href="/">
              <a
                className="text-lg sm:text-3xl color-pal-1 ml-5 hover:text-gray-400 transition-colors"
                aria-label="home"
              >
                <h1>HerbGrinders.com</h1>
              </a>
            </Link>
            <form
              onSubmit={submitHandler}
              className="mx-auto hidden w-1/2 justify-center md:flex flex-grow rounded mx-5"
            >
              <input
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                className="search-input rounded-l p-2 text-sm focus:ring-0 border border-gray-300"
                placeholder="Search"
              />
              <button
                className="rounded-r p-2 text-sm bg-gray-800 text-white border border-green-600"
                type="submit"
                id="button-addon2"
                aria-label="search-submit"
              >
                <FontAwesomeIcon icon={faSearch} className="w-5 h-5" />
              </button>
            </form>
            <div>
              <div className="flex items-center md:mr-5">
                <Link href="/cart">
                  <a
                    className="pl-2 md:pr-2 md:mr-2 hover:text-gray-400 transition-colors"
                    aria-label="cart"
                  >
                    {cartItemsCount > 0 && (
                      <span className="ml-1 rounded-full bg-green-500 px-2 py-1 text-xs text-black">
                        {cartItemsCount}
                      </span>
                    )}
                    <FontAwesomeIcon
                      icon={faShoppingCart}
                      className="w-5 h-5 text-white hover:text-gray-400 transition-colors"
                    />
                  </a>
                </Link>
                <div className="hidden md:block">
                  {status === 'loading' ? (
                    'Loading'
                  ) : session?.user ? (
                    <Menu
                      as="div"
                      className="relative profile-menu inline-block"
                    >
                      <Menu.Button className="text-white hover:text-gray-400 transition-colors">
                        {session.user.firstName}
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 w-56 origin-top-right bg-white shadow-lg rounded">
                        <Menu.Item>
                          <DropdownLink
                            className="dropdown-link hover:bg-gray-200 transition-colors"
                            href="/profile"
                          >
                            Profile
                          </DropdownLink>
                        </Menu.Item>
                        <Menu.Item>
                          <DropdownLink
                            className="dropdown-link hover:bg-gray-200 transition-colors"
                            href="/order-history"
                          >
                            Order History
                          </DropdownLink>
                        </Menu.Item>
                        {session.user.isAdmin && (
                          <Menu.Item>
                            <DropdownLink
                              className="dropdown-link hover:bg-gray-200 transition-colors"
                              href="/admin/dashboard"
                            >
                              Admin Dashboard
                            </DropdownLink>
                          </Menu.Item>
                        )}
                        <Menu.Item>
                          <DropdownLink
                            className="dropdown-link hover:bg-gray-200 transition-colors"
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
                      <a
                        className="p-2 hover:text-gray-400 transition-colors"
                        aria-label="login"
                      >
                        <FontAwesomeIcon
                          icon={faUser}
                          className="w-5 h-5 text-white hover:text-gray-400 transition-colors"
                        />
                      </a>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </nav>
        </header>

        <MobileNavigationMenu
          isOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          Menu={Menu}
          session={session}
          logoutClickHandler={logoutClickHandler}
          DropdownLink={DropdownLink}
        />
        <div className="px-4 md:px-8 lg:px-32 2xl:px-64 hidden md:block  text-white bg-gray-800">
          <NavigationMenu />
        </div>
      </div>
      <main
        className={`container ${
          applyMarginPadding ? 'px-4 md:px-8 lg:px-32 2xl:px-64' : ''
        }`}
      >
        {children}
      </main>

      <footer className="bg-gray-200 text-black py-8 mt-12">
        <div className="container mx-auto px-4 md:px-8 lg:px-32 2xl:px-64">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start md:justify-items-center">
            <div>
              <h3 className="text-lg color-pal-1 mb-2">Products</h3>
              <ul className="text-md">
                <li className="py-1">
                  <Link href="/category/rotary-grinders">
                    <a
                      className="hover:text-orange-500 transition duration-200"
                      aria-label="rotary"
                    >
                      Rotary Grinders
                    </a>
                  </Link>
                </li>
                <li className="py-1">
                  <Link href="/category/grinder-cards">
                    <a
                      className="hover:text-orange-500 transition duration-200"
                      aria-label="cards"
                    >
                      Grinder Cards
                    </a>
                  </Link>
                </li>
                <li className="py-1">
                  <Link href="/category/electric-grinders">
                    <a
                      className="hover:text-orange-500 transition duration-200"
                      aria-label="cards"
                    >
                      Electric Grinders
                    </a>
                  </Link>
                </li>
                <li className="py-1">
                  <Link href="/category/crank-top-grinders">
                    <a
                      className="hover:text-orange-500 transition duration-200"
                      aria-label="cards"
                    >
                      Crank Grinders
                    </a>
                  </Link>
                </li>
                <li className="py-1">
                  <Link href="/category/grind-stash">
                    <a
                      className="hover:text-orange-500 transition duration-200"
                      aria-label="cards"
                    >
                      Grind & Stash
                    </a>
                  </Link>
                </li>
                {/* Add more categories here */}
              </ul>
            </div>
            <div className="order-last md:order-first flex justify-center items-center">
              <Link href="/">
                <a
                  className="text-2xl md:text-3xl color-pal-1 ml-5"
                  aria-label="home"
                >
                  <h2>HerbGrinders.com</h2>
                </a>
              </Link>
            </div>
            <div>
              <h3 className="text-lg mb-2 color-pal-1">Information</h3>
              <ul className="text-md">
                <li className="py-1">
                  <Link href="/about-us">
                    <a
                      className="hover:text-orange-500 transition duration-200"
                      aria-label="about-us"
                    >
                      About Us
                    </a>
                  </Link>
                </li>
                <li className="py-1">
                  <Link href="/terms-conditions">
                    <a
                      className="hover:text-orange-500 transition duration-200"
                      aria-label="terms"
                    >
                      Terms & Conditions
                    </a>
                  </Link>
                </li>
                <li className="py-1">
                  <Link href="/privacy">
                    <a
                      className="hover:text-orange-500 transition duration-200"
                      aria-label="privacy"
                    >
                      Privacy Policy
                    </a>
                  </Link>
                </li>
                <li className="py-1">
                  <Link href="/shipping-info">
                    <a
                      className="hover:text-orange-500 transition duration-200"
                      aria-label="shipping"
                    >
                      Shipping Info
                    </a>
                  </Link>
                </li>
                <li className="py-1">
                  <Link href="/returns">
                    <a
                      className="hover:text-orange-500 transition duration-200"
                      aria-label="returns"
                    >
                      Returns & Refunds
                    </a>
                  </Link>
                </li>
                <li className="py-1">
                  <Link href="/contact-us">
                    <a
                      className="hover:text-orange-500 transition duration-200"
                      aria-label="contact"
                    >
                      Contact Us
                    </a>
                  </Link>
                </li>
                {/* Add more links here */}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-300 mt-8 pt-6 text-center text-sm text-black">
            <p>© 2023 HerbGrinders.com | All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </>
  );
}
