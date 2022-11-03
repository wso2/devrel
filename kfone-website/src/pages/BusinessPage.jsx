import React, { useState } from 'react';
import { HiMenuAlt3 } from 'react-icons/hi';
import { GiCrossedAirFlows } from 'react-icons/gi';
import { GrClose } from 'react-icons/gr';
import { IoIosCheckmarkCircleOutline } from 'react-icons/io';
import { RiSignalTowerFill, RiPieChart2Line } from 'react-icons/ri';
import { BsHddNetwork, BsCloud, BsPeople } from 'react-icons/bs';
import { MdOutlineDevices } from 'react-icons/md';
import office_people from '../assets/images/people/office_people.jpg';
import testimonial from '../assets/images/people/testimonial.jpg';
import supportPeople from '../assets/images/people/support.jpg';
import Footer from '../layouts/Footer';

const IconPill = ({ icon, text }) => {
  return (
    <div className="grid grid-cols-3 gap-2 items-center justify-between border text-secondary border-secondary-600 rounded-lg p-4 hover:shadow-sm hover:shadow-secondary h-full">
      <div className="mr-4">{icon}</div>
      <div className="font-light text-left col-span-2">
        <h2>{text}</h2>
      </div>
    </div>
  );
};

const BusinessPage = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useState(() => {
    window.scroll(0, 0);
  }, []);

  const handleNavMenuButton = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  return (
    <div className="min-h-screen font-body text-black scroll-smooth">
      <nav className="flex justify-between items-center h-20 px-6 max-w-[1440px] mx-auto">
        <div className="flex justify-start items-center">
          <h1 className="flex items-center w-full text-primary text-3xl font-title">
            <GiCrossedAirFlows size={56} />
            <div className="ml-2 flex flex-col justify-start">
              <div>Kfone</div>
              <div className="font-display font-medium text-secondary text-sm">Enterprise</div>
            </div>
          </h1>
          <ul className="hidden md:flex ml-4">
            <li className="px-4">Products</li>
            <li className="px-4">Services</li>
            <li className="px-4">Support</li>
          </ul>
        </div>
        <ul className="flex justify-end items-center">
          {/* <li className="px-4">
            <RoundedIconButton icon={<AiOutlineLogin />} text="Sign in" />
          </li> */}
          <li onClick={handleNavMenuButton} className="text-secondary block md:hidden">
            {mobileNavOpen ? <GrClose size={24} /> : <HiMenuAlt3 size={24} />}
          </li>
        </ul>
        <div
          className={
            mobileNavOpen
              ? 'fixed left-0 top-0 w-[60%] h-full bg-secondary text-white ease-in-out duration-500'
              : 'fixed left-[-100%]'
          }>
          <h1 className="flex items-center w-full text-white text-3xl font-title m-4">
            <GiCrossedAirFlows size={56} />
            <div className="ml-2 flex flex-col justify-start">
              <div>Kfone</div>
              <div className="font-display font-medium text-secondary-100 text-sm">Enterprise</div>
            </div>
          </h1>
          <ul className="p-4">
            <li className="p-4">Products</li>
            <li className="p-4">Services</li>
            <li className="p-4">Support</li>
          </ul>
        </div>
      </nav>
      <div className="p-6 space-y-8">
        <main>
          <div className="container mx-auto space-y-16">
            <section className="grid gap-6 text-center lg:grid-cols-2 xl:grid-cols-5">
              <div className="w-full p-6 rounded-md sm:p-16 xl:col-span-2 bg-secondary-900 text-light">
                <span className="block mb-2 text-primary-200">Anywhere • Anytime</span>
                <h1 className="text-5xl font-bold text-gray-50">
                  Solutions Tailored to Fit Your Business
                </h1>
                <p className="my-8">
                  Let
                  <span className="font-bold text-white font-title">&nbsp;Kfone&nbsp;</span>take
                  care of your telecommunication and cloud requirements no matter what your business
                  scale is.
                </p>
                <ul className="mt-10">
                  <li className="mb-4 flex items-center">
                    <IoIosCheckmarkCircleOutline size={20} className="mr-2 text-primary-200" />
                    Small Business
                  </li>
                  <li className="mb-4 flex items-center">
                    <IoIosCheckmarkCircleOutline size={20} className="mr-2 text-primary-200" />
                    Enterprise & medium business
                  </li>
                  <li className="mb-4 flex items-center">
                    <IoIosCheckmarkCircleOutline size={20} className="mr-2 text-primary-200" />
                    Public Sector
                  </li>
                </ul>
              </div>
              <img
                src={office_people}
                alt=""
                className="object-cover w-full h-full rounded-md xl:col-span-3 bg-gray-500"
              />
            </section>
            <section>
              <span className="block mb-2 text-xs font-medium tracking-widest uppercase lg:text-center text-secondary-900">
                Our Services
              </span>
              <h2 className="text-4xl lg:text-center text-secondary-700">
                Choose services you need with our flexible plans
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center justify-center py-5">
                <IconPill
                  icon={<RiSignalTowerFill size={36} className="text-primary-100" />}
                  text={'Connectivity'}
                />
                <IconPill
                  icon={<BsPeople size={36} className="text-primary-100" />}
                  text={'Collaboration'}
                />
                <IconPill
                  icon={<BsCloud size={36} className="text-primary-100" />}
                  text={'Cloud & Colocation'}
                />
                <IconPill
                  icon={<BsHddNetwork size={36} className="text-primary-100" />}
                  text={'Business Networks'}
                />
                <IconPill
                  icon={<MdOutlineDevices size={36} className="text-primary-100" />}
                  text={'Phones & Devices'}
                />
                <IconPill
                  icon={<RiPieChart2Line size={36} className="text-primary-100" />}
                  text={'Data Insights'}
                />
              </div>
            </section>
            <section className="mt-16">
              <span className="block mb-2 text-xs font-medium tracking-widest uppercase lg:text-center text-secondary-900">
                How it works
              </span>
              <h2 className="text-4xl lg:text-center text-secondary-700">
                Powering your business with <span className="font-title">Kfone</span> is simple
              </h2>
              <div className="grid gap-6 my-10 lg:grid-cols-3">
                <div className="flex flex-col p-8 space-y-4 rounded-md bg-light">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl font-bold rounded-full bg-primary-100 text-gray-100">
                    1
                  </div>
                  <p className="text-2xl font-semibold">
                    <b>Contact</b> our sales team. We&apos;re always there to help you.
                  </p>
                </div>
                <div className="flex flex-col p-8 space-y-4 rounded-md bg-light">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl font-bold rounded-full bg-primary-100 text-gray-100">
                    2
                  </div>
                  <p className="text-2xl font-semibold">
                    <b>Customize</b> a business plan that suits to your business needs.
                  </p>
                </div>
                <div className="flex flex-col p-8 space-y-4 rounded-md bg-light">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl font-bold rounded-full bg-primary-100 text-gray-100">
                    3
                  </div>
                  <p className="text-2xl font-semibold">
                    <b>Enjoy and grow</b> your business powered by Kfone enterprise solutions.
                  </p>
                </div>
              </div>
            </section>
            <section className="p-6 bg-secondary-800 text-gray-100">
              <div className="container grid gap-6 mx-auto text-center items-center lg:grid-cols-2 xl:grid-cols-5">
                <div className="w-full px-6 py-16 rounded-md sm:px-12 md:px-16 xl:col-span-2 bg-gray-900">
                  <span className="block mb-2 text-primary-300">Let&apos;s get started!</span>
                  <h1 className="text-5xl font-extrabold text-gray-50">Contact us</h1>
                  <p className="my-8">
                    <span className="font-medium text-gray-50">Drop us a message&nbsp;</span> with
                    you inquiry and we will get back to you as soon as possible.
                  </p>
                  <form
                    noValidate=""
                    action=""
                    className="self-stretch space-y-3 ng-untouched ng-pristine ng-valid">
                    <div>
                      <label htmlFor="name" className="text-sm sr-only">
                        Your name
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        className="w-full rounded-md focus:ring focus:ring-primary-300 border-gray-700"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="text-sm sr-only">
                        Company
                      </label>
                      <input
                        id="company"
                        type="text"
                        placeholder="Company"
                        className="w-full rounded-md focus:ring focus:ring-primary-300 border-gray-700"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastname" className="text-sm sr-only">
                        Email address
                      </label>
                      <input
                        id="lastname"
                        type="text"
                        placeholder="Email address"
                        className="w-full rounded-md focus:ring focus:ring-primary-300 border-gray-700"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="text-sm sr-only">
                        Message
                      </label>
                      <textarea
                        id="message"
                        placeholder="Message"
                        rows="3"
                        className="block w-full rounded-md focus:ring focus:ring-opacity-75 focus:ring-primary-300 dark:bg-gray-800"></textarea>
                    </div>
                    <button
                      type="button"
                      className="w-full py-2 font-semibold rounded bg-primary text-light">
                      Send Message
                    </button>
                  </form>
                </div>
                <img
                  src={supportPeople}
                  alt=""
                  className="object-cover w-full rounded-md xl:col-span-3 bg-gray-500"
                />
              </div>
            </section>
            <section className="mt-16">
              <span className="block mb-2 text-xs font-medium tracking-widest uppercase lg:text-center text-secondary-900">
                Testimonials
              </span>
              <h2 className="text-4xl lg:text-center text-secondary-700">
                What our customers are saying about us
              </h2>
              <div className="my-8 py-8 bg-secondary-900 text-gray-100">
                <div className="container flex flex-col items-center p-4 mx-auto space-y-6 md:p-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    fill="currentColor"
                    className="w-16 h-16 text-primary-200">
                    <polygon points="328.375 384 332.073 458.999 256.211 406.28 179.924 459.049 183.625 384 151.586 384 146.064 496 182.756 496 256.169 445.22 329.242 496 365.936 496 360.414 384 328.375 384"></polygon>
                    <path d="M415.409,154.914l-2.194-48.054L372.7,80.933,346.768,40.414l-48.055-2.2L256,16.093,213.287,38.219l-48.055,2.2L139.3,80.933,98.785,106.86l-2.194,48.054L74.464,197.628l22.127,42.715,2.2,48.053L139.3,314.323l25.928,40.52,48.055,2.195L256,379.164l42.713-22.126,48.055-2.195,25.928-40.52L413.214,288.4l2.195-48.053,22.127-42.715Zm-31.646,76.949L382,270.377l-32.475,20.78-20.78,32.475-38.515,1.76L256,343.125l-34.234-17.733-38.515-1.76-20.78-32.475L130,270.377l-1.759-38.514L110.5,197.628,128.237,163.4,130,124.88,162.471,104.1l20.78-32.474,38.515-1.76L256,52.132l34.234,17.733,38.515,1.76,20.78,32.474L382,124.88l1.759,38.515L401.5,197.628Z"></path>
                  </svg>
                  <p className="px-6 py-2 text-2xl font-semibold text-center sm:font-bold sm:text-3xl md:text-4xl lg:max-w-2xl xl:max-w-4xl text-gray-300">
                    &quot;We always rely on Kfone&apos;s cloud services. Since we joined with Kfone
                    we didn&apos;t have to worry a bit. 100% uptime is guaranteed.&quot;
                  </p>
                  <div className="flex justify-center space-x-3">
                    <img
                      src={testimonial}
                      alt=""
                      className="w-20 h-20 bg-center bg-cover rounded-md bg-gray-700"
                    />
                    <div>
                      <p className="leading-tight">John Doe</p>
                      <p className="text-sm leading-tight text-gray-300">
                        Founder/CEO, Neo Digital
                      </p>
                      <a
                        className="flex items-center py-2 space-x-1 text-sm text-primary-300"
                        href="/">
                        <span>Read full story</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4">
                          <path
                            fillRule="evenodd"
                            d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="container mx-auto grid grid-cols-1 gap-8 lg:gap-20 md:px-10 md:pb-10 lg:grid-cols-2 mt-12">
                  <div className="flex flex-col items-center mx-12 lg:mx-0">
                    <div className="relative text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        fill="currentColor"
                        className="absolute top-0 left-0 w-8 h-8 dark:text-gray-700">
                        <path d="M232,246.857V16H16V416H54.4ZM48,48H200V233.143L48,377.905Z"></path>
                        <path d="M280,416h38.4L496,246.857V16H280ZM312,48H464V233.143L312,377.905Z"></path>
                      </svg>
                      <p className="px-6 py-1 text-lg italic">
                        &nbsp;We&apos;ve seen amazing results already. Kfone impressed me on
                        multiple levels. Kfone did exactly what you said it does.&nbsp;
                      </p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        fill="currentColor"
                        className="absolute bottom-0 right-0 w-8 h-8 dark:text-gray-700">
                        <path d="M280,185.143V416H496V16H457.6ZM464,384H312V198.857L464,54.1Z"></path>
                        <path d="M232,16H193.6L16,185.143V416H232ZM200,384H48V198.857L200,54.1Z"></path>
                      </svg>
                    </div>
                    <span className="w-12 h-1 my-2 rounded-lg bg-primary-200"></span>
                    <p>Zarla N.</p>
                  </div>
                  <div className="flex flex-col items-center max-w-lg mx-12 lg:mx-0">
                    <div className="relative text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        className="absolute top-0 left-0 w-8 h-8 dark:text-gray-700">
                        <path
                          fill="currentColor"
                          d="M232,246.857V16H16V416H54.4ZM48,48H200V233.143L48,377.905Z"></path>
                        <path
                          fill="currentColor"
                          d="M280,416h38.4L496,246.857V16H280ZM312,48H464V233.143L312,377.905Z"></path>
                      </svg>
                      <p className="px-6 py-1 text-lg italic">
                        &nbsp;Kfone is the most valuable business resource we have EVER purchased.
                        Kfone has really helped our business.&nbsp;
                      </p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        className="absolute bottom-0 right-0 w-8 h-8 dark:text-gray-700">
                        <path
                          fill="currentColor"
                          d="M280,185.143V416H496V16H457.6ZM464,384H312V198.857L464,54.1Z"></path>
                        <path
                          fill="currentColor"
                          d="M232,16H193.6L16,185.143V416H232ZM200,384H48V198.857L200,54.1Z"></path>
                      </svg>
                    </div>
                    <span className="w-12 h-1 my-2 rounded-lg bg-primary-200"></span>
                    <p>Renelle D.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default BusinessPage;
