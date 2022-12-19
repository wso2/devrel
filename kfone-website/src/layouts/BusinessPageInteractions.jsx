import WebinarSection from './user-interactions/WebinarSection';
import WhitepaperSection from './user-interactions/WhitepaperSection';

const BusinessPageInteractions = () => {
  return (
    <section className="mt-16">
      <span className="block mb-2 text-xs font-medium tracking-widest uppercase lg:text-center text-secondary-900">
        Freely Available Resources
      </span>
      <h2 className="text-4xl lg:text-center text-secondary-700">
        Grow Your Business with <span className="font-title">Kfone</span>
      </h2>
      <p className="text-sm max-w-2xl mx-auto my-5 text-center text-secondary-600">
        Here are some resources to learn and grow your venture with our expertise gained by working
        with over thousands of small to large scaled businesses for the past 20 years. We gladly
        share these resources with you to help to take your business to the next level.
      </p>
      <WhitepaperSection />
      <WebinarSection />
    </section>
  );
};

export default BusinessPageInteractions;
