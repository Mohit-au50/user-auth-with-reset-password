import React from "react";
import { Link } from "react-router-dom";

const NotFound404 = () => {
  return (
    <div className="h-screen w-full grid place-items-center">
      <div className="sm:w-[500px] w-[300px] p-5">
        <div className="flex justify-evenly gap-2 items-center font-light sm:text-[180px] text-9xl">
          <h1>4</h1>
          <div className="mt-5 w-24 h-24 sm:w-32 sm:h-32 bg-black rounded-full"></div>
          <h1>4</h1>
        </div>
        <p className="text-center my-7 tracking-wider">
          we <span className="line-through">could</span> couldn't find the page
          you're looking for.
        </p>
        <p className="text-center mt-5">
          <Link
            to="/"
            className="py-2 px-4 text-center tracking-wide text-green-600"
          >
            Go to homepage
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound404;
