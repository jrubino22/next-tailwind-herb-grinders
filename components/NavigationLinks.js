import React from 'react';
import Link from 'next/link';

const menuItems = [
  { id: 1, title: 'Blog', link: '/blog' },
  { id: 2, title: 'All Products', link: '/search' },
  { id: 3, title: 'Rotary Grinders', link: '/#' },
  { id: 4, title: 'Grinder Cards', link: '/#' },
];

const NavigationMenu = () => {
  return (
    <nav>
      <ul className="flex space-x-4">
        {menuItems.map((item) => (
          <li key={item.id}>
            <Link href={item.link}>
              <a className="text-lg">{item.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavigationMenu;