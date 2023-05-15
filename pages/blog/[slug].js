import Image from 'next/image';
import Layout from '../../components/Layout';
import BlogPost from '../../models/BlogPost';
import db from '../../utils/db';
import ReactMarkdown from 'react-markdown';
import React from 'react';
import rehypeRaw from 'rehype-raw';
import { decodeEntitiesPlugin } from '../../utils/utils';

export default function BlogPostPage({ post }) {
  // const contentHtml = md.render(post.content);
  const components = {
    html: ({ node, ...props }) => {
      return <div dangerouslySetInnerHTML={{ __html: node.data }} {...props} />;
    },
  };

  // const decodedContent = decodeHtmlEntities(post.content)

  return (
    <Layout title={post.title} applyMarginPadding={false}>
      <div className="relative w-full h-96 mb-6">
        <Image
          src={post.image.url}
          alt={post.image.altText}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="container mx-auto px-4 md:px-8 lg:px-32 2xl:px-80">
        <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
        {post.subtitle && (
          <h2 className="text-xl font-semibold mb-10 border-b-2">{post.subtitle}</h2>
        )}
        {post.author.length > 4 && (
          <p className="text-gray-500 mb-5">By {post.author}</p>
        )}
        <div className="blog-p post-content prose prose-lg text-gray-800">
          <ReactMarkdown
            components={components}
            rehypePlugins={[rehypeRaw, decodeEntitiesPlugin]}
          >
            {post.content}
          </ReactMarkdown>
          {/* <div dangerouslySetInnerHTML={{ __html: contentHtml }} /> */}
        </div>
      </div>
    </Layout>
  );
}

// This function runs at build time in production and 
// generates the paths for all of your blog posts
export async function getStaticPaths() {
  await db.connect();
  const posts = await BlogPost.find({}).lean();
  await db.disconnect();

  // Generate the paths for getStaticProps
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));

  // If a page is not generated at build time, it will result in a 404 page
  return { paths, fallback: false };
}

// This function runs at build time in production, and
// whenever a request is made to a blog post path in development
export async function getStaticProps({ params }) {
  await db.connect();
  const post = await BlogPost.findOne({ slug: params.slug }).lean();

  if (!post) {
    return {
      notFound: true,
    };
  }

  await db.disconnect();
  return {
    props: {
      post: db.convertDocToObj(post),
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every second (you can adjust this value)
    revalidate: 1,
  };
}
