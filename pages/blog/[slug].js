import Image from 'next/image';
import Layout from '../../components/Layout';
import BlogPost from '../../models/BlogPost';
import db from '../../utils/db';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

export default function BlogPostPage({ post }) {
  const contentHtml = md.render(post.content);

  return (
    <Layout title={post.title}>
      <div className="relative w-full h-96 mb-6">
        <Image
          src={post.image.url}
          alt={post.image.altText}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="container mx-auto px-4 md:px-8 lg:px-32">
        <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
        {post.subtitle && <h2 className="text-xl font-semibold mb-5">{post.subtitle}</h2>}
        {post.author.length > 4 && <p className="text-gray-500 mb-5">By {post.author}</p>}
        <div className="post-content prose prose-lg text-gray-800">
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
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
  };
}