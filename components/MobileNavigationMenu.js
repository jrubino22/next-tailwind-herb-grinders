import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const menuItems = [
  { id: 1, title: 'Blog', link: '/blog' },
  { id: 2, title: 'All Products', link: '/search' },
  { id: 3, title: 'Rotary Grinders', link: '/category/rotary-grinders' },
  { id: 4, title: 'Grinder Cards', link: '/category/grinder-cards' },
];

const MobileNavigationMenu = ({ isOpen, setMobileMenuOpen }) => {
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
        <div className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50">
          <nav
            ref={menuRef}
            className="absolute top-0 left-0 w-3/4 max-w-sm h-full bg-white shadow-lg"
          >
            <button
              className="p-4 text-white absolute right-0 top-0"
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
            <ul className="divide-y divide-gray-200">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link href={item.link}>
                    <a
                      className="block w-full p-4 text-gray-700 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.title}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};

export default MobileNavigationMenu;
