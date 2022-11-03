import IPhoneCarouselImage from '../../../assets/images/explore/carousel/01.png';
import PixelCarouselImage from '../../../assets/images/explore/carousel/02.png';

export const Carousel = () => {
  return (
    <div className="carousel w-full rounded-lg mt-4 md:mt-8">
      <div id="slide1" className="carousel-item relative w-full">
        <img src={IPhoneCarouselImage} className="w-full" />
        <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
          <a href="#slide4" className="btn btn-circle">
            ❮
          </a>
          <a href="#slide2" className="btn btn-circle">
            ❯
          </a>
        </div>
      </div>
      <div id="slide2" className="carousel-item relative w-full">
        <img src={PixelCarouselImage} className="w-full" />
        <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
          <a href="#slide1" className="btn btn-circle">
            ❮
          </a>
          <a href="#slide3" className="btn btn-circle">
            ❯
          </a>
        </div>
      </div>
    </div>
  );
};
