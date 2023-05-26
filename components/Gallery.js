import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export default function Gallery({ images, selectedSubProductImage }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleImageChange = useCallback(
    (newImage) => {
      if (!newImage) {
        setSelectedImageIndex(0);
        return;
      }

      const matchingImage = images.findIndex((image) => image.url === newImage.url);
      if (matchingImage >= 0 && matchingImage < images.length) {
        setSelectedImageIndex(matchingImage);
      } else {
        setSelectedImageIndex(0);
      }
    },
    [images]
  );

  useEffect(() => {
    handleImageChange(selectedSubProductImage);
  }, [handleImageChange, selectedSubProductImage]);

  return (
    <div className="overflow-hidden">
      <div>
        <div className="large-img-prod mx-auto relative h-64 w-full">
          <Image
            src={images[selectedImageIndex].url}
            alt={images[selectedImageIndex].altText}
            className="mx-auto max-w-full h-auto absolute inset-0 object-cover"
            
            height="1280"
            width="1280"
            priority
          />
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-center thumbnails p-2">
          {images.map((image, index) => (
            <div
              key={image.url}
              className={`w-16 md:w-20 mx-2 my-1 cursor-pointer ${
                selectedImageIndex === index
                  ? 'selected-thumbnail'
                  : 'opacity-50'
              }`}
              onClick={() => handleImageClick(index)}
            >
              <Image
                src={image.url}
                alt={image.altText}
                width={80}
                height={60}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
