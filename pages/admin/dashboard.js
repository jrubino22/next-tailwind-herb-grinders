import Link from 'next/link';
import React from 'react'
import Layout from '../../components/Layout';

function AdminDashboardScreen() {
  return (
    <Layout title="Admin Dashboard">
        <div className="grid md:grid-cols-4 md:gap-5">
            <div>
                <ul>
                    <li>
                        <Link href="/admin/dashboard">
                            <a className="font-bold">Dashboard</a>
                        </Link>
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
                </ul>
            </div>
        </div>
    </Layout>
  )
}

AdminDashboardScreen.auth = { adminOnly: true };
export default AdminDashboardScreen