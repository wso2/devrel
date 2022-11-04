const Error = () => {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div className="px-4 lg:py-12">
        <div className="lg:gap-4 lg:flex">
          <div className="flex flex-col items-center justify-center md:py-24 lg:py-32">
            <p className="mb-2 text-2xl font-bold text-center text-gray-800 md:text-3xl">
              <span className="text-red-500">Oops!</span> Something is wrong!
            </p>
            <a href="/" className="mt-6 px-6 py-2 text-sm rounded-lg font-semibold text-white bg-primary">
              Go home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error;
