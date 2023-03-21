import Link from 'next/link';

export default function BlogPostItem({ post }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <Link href={`/blog/${post.slug}`}>
        <a>
          <img src={post.image} alt={post.title} className="rounded-md mb-3" />
          <h3 className="font-semibold text-lg">{post.title}</h3>
          <p className="text-gray-500">{post.summary}</p>
        </a>
      </Link>
    </div>
  );
}