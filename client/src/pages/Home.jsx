import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { UserContext } from "../context/userContext";
import { Link } from "react-router-dom";
import { Blurhash } from "react-blurhash";

const Home = ({ userName, email, avatar, blur_hash }) => {
  console.log(blur_hash);
  const { setLoggedInUser } = useContext(UserContext);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await axios("/user/logout");
      console.log(res);

      if (res.status === 200) {
        setLoggedInUser(null);
        toast("logout, hope");
      } else {
        toast.error(res.data);
      }
    } catch (error) {
      console.error("error in home.jsx", error);
    }
  };

  return (
    <>
      <main className="relative h-screen w-full tracking-wide grid place-items-center">
        <div className="absolute inset-0 h-1/2 lg:w-1/3 lg:h-full bg-black/90"></div>
        <header className="absolute top-0 left-0 right-0 h-[5rem] flex items-center px-14">
          <Link to="/" className="text-4xl font-bold text-white tracking-wider">
            Auth
          </Link>
        </header>

        <div className="relative container w-4/5">
          <section className="flex flex-col md:flex-row lg:flex-row w-full lg:p-24 z-30">
            <div
              className={`w-full bg-rose-400 aspect-square overflow-hidden ${
                imageLoaded ? "hidden" : "inline"
              }`}
            >
              <Blurhash
                hash={blur_hash}
                width={"100%"}
                height={"100%"}
                resolutionX={32}
                resolutionY={32}
                punch={1}
              />
            </div>

            <div
              className={`w-full h-full ${imageLoaded ? "inline" : "hidden"}`}
            >
              <img
                src={avatar}
                alt=""
                className="w-full aspect-square object-cover"
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            <div className="w-full grid place-items-center">
              <div className="text-center py-5 tracking-wider">
                <h1 className="font-bold text-2xl sm:text-4xl">{userName}</h1>
                <p className="text-green-600 my-5">{email}</p>
                <button
                  className="tracking-wider px-7 py-3 font-bold rounded bg-red-300 text-red-800"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Home;
