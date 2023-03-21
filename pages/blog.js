import { useState } from 'react';
import Layout from '../components/Layout';
import BlogPostItem from '../components/BlogPostItem';
import BlogPost from '../models/BlogPost';
import db from '../utils/db';
import Pagination from '../components/Pagination';

export default function Blog({ blogPosts }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogPosts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Layout title="Blog">
      <h2 className="h2 my-4 font-bold text-xl ml-5">Latest Blog Posts</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {currentPosts.map((post) => (
          <BlogPostItem post={post} key={post.slug}></BlogPostItem>
        ))}
      </div>
      <Pagination
        postsPerPage={postsPerPage}
        totalPosts={blogPosts.length}
        paginate={paginate}
      />
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  const blogPosts = await BlogPost.find().lean();

  return {
    props: {
      blogPosts: JSON.parse(JSON.stringify(blogPosts.map(db.convertDocToObj))),
    },
  };
}
