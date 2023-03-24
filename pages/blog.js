import { useState } from 'react';
import Image from 'next/image';
import Layout from '../components/Layout';
import BlogPostItem from '../components/BlogPostItem';
import BlogPost from '../models/BlogPost';
import Blog from '../models/Blog';
import db from '../utils/db';
import Pagination from '../components/Pagination';

export default function BlogPage({ blogPosts, blogInfo }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogPosts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Layout title="Blog" applyMarginPadding={false}>
      <div className="relative w-full h-96">
        <Image
          src={blogInfo.image.url}
          alt={blogInfo.image.altText}
          layout="fill"
          objectFit="cover"
          priority
        />
        
        <div
          className="absolute bottom-0 left-0 w-full p-5 text-white"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          
          <h1 className="text-4xl font-bold mb-2">{blogInfo.title}</h1>
          <p>{blogInfo.description}</p>
        </div>
      </div>
      <div className="my-4 px-4">
      <h2 className="h2 my-4 font-bold text-xl ml-5">Latest Blog Posts</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 gap-4">
        {currentPosts.map((post) => (
          <BlogPostItem post={post} key={post.slug}></BlogPostItem>
        ))}
      </div>
      </div>
      {currentPosts.length > 10 &&
      <Pagination
        postsPerPage={postsPerPage}
        totalPosts={blogPosts.length}
        paginate={paginate}
      />
    }
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  const blogPosts = await BlogPost.find().lean();
  const blogInfo = await Blog.findById('641b7f313c20b64cd274b04b').lean();

  return {
    props: {
      blogPosts: JSON.parse(JSON.stringify(blogPosts.map(db.convertDocToObj))),
      blogInfo: JSON.parse(JSON.stringify(db.convertDocToObj(blogInfo))),
    },
  };
}
