import React from 'react';
import HeaderTitle from '../components/headers/HeaderTitle';
import smart_tv from '../assets/images/entertainment/smart_tv.jpg';
import social_media from '../assets/images/entertainment/social_media.jpg';
import live_streaming from '../assets/images/entertainment/live_streaming.jpg';
import music from '../assets/images/entertainment/music.jpg';
import movies from '../assets/images/entertainment/movies.jpg';
import background_waves from '../assets/images/background-waves.svg';

const OverlayCard = ({ image, header, subHeader, description }) => {
  return (
    <div
      className="flex flex-col items-center justify-between py-5 h-80 md:h-[360px] bg-secondary-800 rounded-lg shadow-secondary-500 shadow-md delay-150 hover:scale-105 duration-300 text-white bg-blend-overlay transition ease-in-out hover:bg-blend-exclusion bg-center bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${image})` }}>
      <div className="text-center">
        <h1 className="font-light text-lg uppercase">{header}</h1>
        <h4 className="font-thin text-sm">{subHeader}</h4>
      </div>
      <div className="p-4">
        <p className="font-light text-xs text-left">{description}</p>
      </div>
    </div>
  );
};

const EntertainmentSection = () => {
  return (
    <section
      className="mt-10 px-5 xl:px-20 py-10"
      style={{
        backgroundImage: `url(${background_waves})`
      }}>
      <div className="flex flex-col items-center justify-center">
        <HeaderTitle>All the Entertainment You Love</HeaderTitle>
        <h6 className="text-lg font-light text-secondary-600">
          Enjoy exclusive content with Kfone devices and data plan bundles for a low monthly price.
        </h6>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-6 mt-10">
        <OverlayCard
          image={smart_tv}
          header="Watch More"
          subHeader="More than just a TV"
          description="Our 4K streaming TV box is free with Kfone Internet. Plus thousands of awesome TV shows, movies, and documentaries."
        />
        <OverlayCard
          image={social_media}
          header="Stay Connected"
          subHeader="Enjoy all your social platforms"
          description="Worry less data plans to enjoy a ton of social media apps on Kfone internet including Facebook, Instagram, WhatsApp, YouTube, Snapchat, Tik Tok, Viber & IMO"
        />
        <OverlayCard
          image={live_streaming}
          header="Stream All Day"
          subHeader="High-quality, high-speed streaming"
          description="We offer exclusive and flexible data plans for streamers to take their content creation to the next level."
        />
        <OverlayCard
          image={music}
          header="Perfect Harmony"
          subHeader="Play millions of songs and podcasts"
          description="Tune into your favorite music and podcast players all day long on Spotify, Apple Music and many more with our unlimited data plans and device bundles."
        />
        <OverlayCard
          image={movies}
          header="IT's Show Time"
          subHeader="Get millions of Movies & TV Series VOD"
          description="Access star-studded, award winning movies and tv series with our video on demand service at your finger tip. Experience personalized recommendations, DVR and many more features"
        />
      </div>
    </section>
  );
};

export default EntertainmentSection;
