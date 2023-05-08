import Image from 'next/image';
import Layout from '../components/Layout';
import Page from '../models/Page';
import db from '../utils/db';
import ReactMarkdown from 'react-markdown';
import React from 'react';
import rehypeRaw from 'rehype-raw';
import { decodeEntitiesPlugin } from '../utils/utils';

export default function PagePage({ page }) {
  const components = {
    html: ({ node, ...props }) => {
      return <div dangerouslySetInnerHTML={{ __html: node.data }} {...props} />;
    },
  };

  return (
    <Layout title={page.title} metaDesc={page.metaDesc} applyMarginPadding={false}>
      {page.image.url ? (
        <div className="relative w-full h-96 mb-6">
          <Image
            src={page.image.url}
            alt={page.image.altText}
            layout="fill"
            objectFit="cover"
          />
        </div>
      ) : (
        <div className="mb-6"></div>
      )}
      
      <div className="container mx-auto px-4 md:px-8 lg:px-80">
        <h1 className="text-3xl mb-3">{page.title}</h1>
        {page.subtitle && (
          <h2 className="text-xl font-semibold mb-5">{page.subtitle}</h2>
        )}
        <div className="page-content prose prose-lg text-gray-800 page-content">
          <ReactMarkdown
            components={components}
            rehypePlugins={[rehypeRaw, decodeEntitiesPlugin]}
          >
            {page.content}
          </ReactMarkdown>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  await db.connect();
  const page = await Page.findOne({ slug: params.slug }).lean();

  if (!page) {
    return {
      notFound: true,
    };
  }

  await db.disconnect();
  return {
    props: {
      page: db.convertDocToObj(page),
    },
  };
}
