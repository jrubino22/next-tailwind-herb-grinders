import Link from 'next/link';
import Image from 'next/image';

export default function BlogPostItem({ post }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <Link href={`/blog/${post.slug}`}>
        <a>
          <div className="relative w-full h-48 rounded-md mb-3 overflow-hidden">
            <Image
              src={post.image.url}
              alt={post.image.altText}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
          <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
          <p className="text-gray-500">{post.subtitle}</p>
        </a>
      </Link>
    </div>
  );
}