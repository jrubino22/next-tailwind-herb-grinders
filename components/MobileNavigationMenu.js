import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const menuItems = [
  { id: 1, title: 'Blog', link: '/blog' },
  { id: 2, title: 'All Products', link: '/search' },
  { id: 3, title: 'Rotary Grinders', link: '/category/rotary-grinders' },
  { id: 4, title: 'Grinder Cards', link: '/category/grinder-cards' },
  { id: 5, title: 'Crank Grinders', link: '/category/crank-top-grinders' },
  { id: 6, title: 'Grind & Stash', link: '/category/grind-stash' },
];

const MobileNavigationMenu = ({
  isOpen,
  setMobileMenuOpen,
  Menu,
  session,
  logoutClickHandler,
  DropdownLink,
}) => {
  const menuRef = useRef(null);

  const handleClickOutside = useCallback(
    (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    },
    [setMobileMenuOpen]
  );

  const handleTouchStart = useCallback(
    (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    },
    [setMobileMenuOpen]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleTouchStart);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleClickOutside, handleTouchStart]);
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 flex items-stretch">
          <nav
            ref={menuRef}
            className="absolute top-0 left-0 w-3/4 max-w-sm h-full bg-white shadow-lg flex flex-col py-5 px-4"
          >
            <div className="flex items-center justify-between">
              <h1 className="text-xl color-pal-1 text-gray-900">
                HerbGrinders.com
              </h1>
              <button
                aria-label="mobile-menu"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414l4.293-4.293L4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <ul className="divide-y divide-gray-200 flex flex-col justify-between flex-grow mt-5">
              <div>
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link href={item.link}>
                      <a
                        className="flex items-center py-2 px-3 rounded hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="material-icons-outlined text-gray-600 mr-2">
                          {item.icon}
                        </span>
                        {item.title}
                      </a>
                    </Link>
                  </li>
                ))}
              </div>
              <li>
                <div className="mb-4 p-4 text-xl">
                  {session?.user ? (
                    <Menu
                      as="div"
                      className="relative profile-menu inline-block"
                    >
                      <Menu.Button className="color-pal-2">
                        {session.user.firstName}
                      </Menu.Button>
                      <Menu.Items className="absolute bottom-full left-0 w-56 origin-bottom-right bg-white shadow-lg rounded">
                        <Menu.Item>
                          <DropdownLink
                            className="dropdown-link"
                            href="/profile"
                          >
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
                    <Link href="/login">Log in</Link>
                  )}
                </div>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};

export default MobileNavigationMenu;
