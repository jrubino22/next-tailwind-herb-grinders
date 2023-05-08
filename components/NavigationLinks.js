import React from 'react';
import Link from 'next/link';

const leftMenuItems = [
  { id: 1, title: 'Rotary Grinders', link: '/category/rotary-grinders' },
  { id: 2, title: 'Grinder Cards', link: '/category/grinder-cards' },
  { id: 3, title: 'Electric Grinders', link: '/#' },
  { id: 4, title: 'Disposable Grinders', link: '/#' },
  { id: 5, title: 'All Products', link: '/search' },
];

const rightMenuItems = [
  { id: 1, title: 'Blog', link: '/blog' },
  { id: 1, title: 'About Us', link: '/about-us' },
  { id: 1, title: 'FAQs', link: '/blog' },
];

const NavigationMenu = () => {
  return (
    <div className="navbar-style">
      <nav className="container mx-auto px-4 py-2">
        <div className="flex justify-between">
          <ul className="flex items-center space-x-4 ml-5">
            {leftMenuItems.map((item, index) => (
              <li key={index}>
                <Link href={item.link}>
                  <a className="font-weight-600 hover:text-blue-600">
                    {item.title}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
          <ul className="flex items-center space-x-4 mr-5">
            {rightMenuItems.map((item, index) => (
              <li key={index}>
                <Link href={item.link}>
                  <a className="font-weight-600 hover:text-blue-600">
                    {item.title}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default NavigationMenu;
