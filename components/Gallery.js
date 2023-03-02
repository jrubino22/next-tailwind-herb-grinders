import { useState } from "react";

export default function Gallery({ images, variant, onVariantChange }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleVariantChange = (newVariant) => {
    onVariantChange(newVariant);
    setSelectedImageIndex(0);
  };

  const filteredImages = variant
    ? images.filter((image) => image.variant === variant)
    : images;

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start">
      <div className="w-full md:w-1/2 mx-auto">
        <img
          src={filteredImages[selectedImageIndex].url}
          alt={filteredImages[selectedImageIndex].altText}
          className="mx-auto mb-5 md:mb-0"
        />
      </div>
      <div className="w-full md:w-1/2 flex justify-center">
        {variant && (
          <div className="flex items-center mb-5">
            <span className="mr-2">Variant:</span>
            <select
              value={variant}
              onChange={(e) => handleVariantChange(e.target.value)}
            >
              {Array.from(new Set(images.map((image) => image.variant))).map(
                (variant) => (
                  <option key={variant} value={variant}>
                    {variant}
                  </option>
                )
              )}
            </select>
          </div>
        )}
        <div className="flex flex-wrap">
          {filteredImages.map((image, index) => (
            <img
              key={image.url}
              src={image.url}
              alt={image.altText}
              className={`w-16 md:w-24 mx-2 my-1 cursor-pointer ${
                selectedImageIndex === index ? "border-2 border-blue-500" : ""
              }`}
              onClick={() => handleImageClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}