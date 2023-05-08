import Image from 'next/image';
import Link from 'next/link';

const IndexFeatured = ({ images }) => {
  return (
    <div className="relative w-full ">
      <div className="grid grid-cols-2 gap-2 lg:gap-6 lg:grid-cols-4">
        <div className="relative col-span-1 row-span-3 lg:col-span-1 lg:row-span-1 h-full cursor-pointer order-2 lg:order-1 flex flex-col">
          <div className="rounded-lg overflow-hidden">
            <Link href={images[0].link}>
              <Image
                src={images[0].image}
                layout="responsive"
                height="330"
                width="500"
                alt={images[0].alt}
                priority
                className="rounded-lg"
              />
            </Link>
          </div>
          <div className="rounded-lg overflow-hidden mt-2 lg:mt-6">
            <Link href={images[1].link}>
              <Image
                src={images[1].image}
                layout="responsive"
                height="683"
                width="500"
                alt={images[1].alt}
                priority
                className="rounded-lg"
              />
            </Link>
          </div>
          <div className="rounded-lg overflow-hidden mt-2 lg:mt-6">
            <Link href={images[2].link}>
              <Image
                src={images[2].image}
                layout="responsive"
                height="330"
                width="500"
                alt={images[2].alt}
                className="rounded-lg"
              />
            </Link>
          </div>
        </div>
        <div className="relative col-span-2 row-span-3 lg:col-span-2 lg:row-span-1 h-full cursor-pointer order-1 lg:order-2">
          <div className="rounded-lg overflow-hidden">
            <Link href={images[3].link}>
              <Image
                src={images[3].image}
                layout="responsive"
                height="334"
                width="500"
                alt={images[3].alt}
                priority
                className="rounded-lg"
              />
            </Link>
          </div>
          <div className="flex-1 rounded-lg overflow-hidden mt-2 lg:mt-6">
            <Link href={images[4].link}>
              <Image
                src={images[4].image}
                layout="responsive"
                height="334"
                width="500"
                alt={images[4].alt}
                priority
                className="rounded-lg"
              />
            </Link>
          </div>
        </div>
        <div className="relative col-span-1 row-span-3 lg:col-span-1 lg:row-span-1 h-full cursor-pointer order-3 lg:order-3 flex flex-col">
          <div className="rounded-lg overflow-hidden ">
            <Link href={images[5].link}>
              <Image
                src={images[5].image}
                layout="responsive"
                height="329"
                width="500"
                alt={images[5].alt}
                priority
                className="rounded-lg"
              />
            </Link>
          </div>
          <div className="rounded-lg overflow-hidden mt-2 lg:mt-6">
            <Link href={images[6].link}>
              <Image
                src={images[6].image}
                layout="responsive"
                height="329"
                width="500"
                alt={images[6].alt}
                priority
                className="rounded-lg"
              />
            </Link>
          </div>
          <div className="rounded-lg overflow-hidden mt-2 lg:mt-6">
            <Link href={images[7].link}>
              <Image
                src={images[7].image}
                layout="responsive"
                height="688"
                width="500"
                alt={images[7].alt}
                className="rounded-lg"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexFeatured;
