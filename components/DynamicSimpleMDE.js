import React from 'react';
import dynamic from 'next/dynamic';

const SimpleMDE = dynamic(
  () => import('react-simplemde-editor').then((mod) => mod.default),
  { ssr: false }
);

const DynamicSimpleMDE = (props) => {
  return <SimpleMDE {...props} />;
};

export default DynamicSimpleMDE;
