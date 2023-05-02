import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

const AdminMediaMenu = () => {
  const router = useRouter();

  const goToPage = (path) => {
    router.push(path);
  };

  return (
    <Layout title="Admin Media Menu">
      <div className="grid md:grid-cols-4 md:gap-5">
        <div>
          <ul>
            <li>
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link href="/admin/orders">Orders</Link>
            </li>
            <li>
              <Link href="/admin/products">Products</Link>
            </li>
            <li>
              <Link href="/admin/users">Users</Link>
            </li>
            <li>
              <Link href="/admin/media">
                <a className="font-bold">Media</a>
              </Link>
            </li>
          </ul>
        </div>
        <div className="">
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-2xl font-semibold mb-6">Admin Media Menu</h1>
            <button
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700"
              onClick={() => goToPage('/admin/media/banners')}
            >
              Homepage Banners
            </button>
            <button
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700"
              onClick={() => goToPage('/admin/media/index-media')}
            >
              Index Media
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminMediaMenu;
