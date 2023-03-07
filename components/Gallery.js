import { useState, useEffect } from "react";

export default function Gallery({ images, selectedSubProductImage }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleImageChange = (newImage) => {
    if (!newImage) {
      setSelectedImageIndex(0);
      return;
    }

    const matchingImage = images.findIndex(
      (image) => image.url === newImage
    );
    
    setSelectedImageIndex(matchingImage);
  };

  useEffect(() => {
    handleImageChange(selectedSubProductImage);
  }, [selectedSubProductImage])


  
  return (
    <div className="overflow-hidden">
    <div>
      <div className="large-img-prod mx-auto md:p-8 sm:p-2" style={{maxHeight: "50vh"}}>
        <img
          src={images[selectedImageIndex].url}
          alt={images[selectedImageIndex].altText}
          className="mx-auto max-w-full h-auto"
        />
      </div>
    </div>
    <div className="w-full">
      <div className="flex items-center justify-center thumbnails p-2">
        {images.map((image, index) => (
          <img
            key={image.url}
            src={image.url}
            alt={image.altText}
            className={`w-16 md:w-24 mx-2 my-1 cursor-pointer ${
              selectedImageIndex === index
                ? "border-2 border-blue-500 rounded-lg"
                : "opacity-75"
            }`}
            onClick={() => handleImageClick(index)}
          />
        ))}
      </div>
    </div>
  </div>
  );
}