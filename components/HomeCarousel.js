import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './CustomCarousel.module.css';

const HomeCarousel = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselHeight, setCarouselHeight] = useState(0);

  const goToNextSlide = () => {
    setCurrentIndex((currentIndex + 1) % banners.length);
  };

  const goToPreviousSlide = () => {
    setCurrentIndex((currentIndex - 1 + banners.length) % banners.length);
  };

  const updateCarouselHeight = (naturalWidth, naturalHeight) => {
    const aspectRatio = naturalWidth / naturalHeight;
    setCarouselHeight(window.innerWidth / aspectRatio);
  };

  const handleImageLoad = ({ naturalWidth, naturalHeight }) => {
    updateCarouselHeight(naturalWidth, naturalHeight);
  };

  useEffect(() => {
    window.addEventListener('resize', updateCarouselHeight);
    return () => {
      window.removeEventListener('resize', updateCarouselHeight);
    };
  }, []);

  return (
    <div className={styles.carousel} style={{ height: carouselHeight }}>
      <div className={styles.carouselInner}>
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className={`${styles.carouselItem} ${
              index === currentIndex ? styles.active : ''
            }`}
          >
            <a href={banner.link}>
              <div className={styles.imageContainer}>
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  layout="fill"
                  objectFit="cover"
                  onLoadingComplete={handleImageLoad}
                />
              </div>
            </a>
          </div>
        ))}
      </div>
      <button className={styles.prevButton} onClick={goToPreviousSlide}>
        &#10094;
      </button>
      <button className={styles.nextButton} onClick={goToNextSlide}>
        &#10095;
      </button>
    </div>
  );
};


export default HomeCarousel;