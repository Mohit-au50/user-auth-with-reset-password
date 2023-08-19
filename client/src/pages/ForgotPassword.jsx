import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [nodeMailRequest, setNodeMailRequest] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!email) return toast.error("Enter emai address");

      const data = { email };
      const res = await axios.post("/user/request/reset_password", data);
      console.log(res);

      if (res.status === 224) {
        setNodeMailRequest(true);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("error on line", error);
    }
    setLoading(false);
  };

  return (
    <div
      className="h-screen w-full  
    
    grid place-items-center"
    >
      {nodeMailRequest ? (
        <>
          <div className="w-[300px] sm:w-[340px] p-5">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#48bb78"
                className="w-9 h-9 mx-auto my-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <h1 className="text-3xl text-center font-bold mb-5">
              Check Your Email
            </h1>
            <p className="text-sm text-center mb-7">
              Please check the email address {email} for instructions to reset
              your password.
            </p>
            <button
              onClick={handleSubmit}
              className="relative grid place-items-center w-full h-[3rem] rounded border border-gray-300 outline-0"
            >
              {loading ? (
                <div className="absolute animate-ping w-9 h-6 rounded-full bg-gray-300"></div>
              ) : (
                <>Resend email</>
              )}
            </button>

            <p>
              <Link
                className="block mt-5 py-2 text-center tracking-wide text-green-600"
                to="/login"
              >
                Back to Client
              </Link>
            </p>
          </div>
        </>
      ) : (
        <>
          <form className="min-w-[300px] w-[340px] p-5" onSubmit={handleSubmit}>
            <h1 className="text-3xl text-center font-bold mb-5">
              Reset your password
            </h1>
            <p className="text-sm text-center mb-7">
              Enter your email address and we will send you instructions to
              reset your password.
            </p>

            <div className="relative tracking-wide">
              <input
                type="email"
                id="email"
                required
                className="peer  border border-gray-300 focus:invalid:border-red-500 valid:border-green-500 rounded outline-0 block w-full h-[3rem] my-5 px-4 placeholder:text-transparent"
                placeholder={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label
                htmlFor="email"
                className="absolute left-3 -top-3 peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm bg-white px-1 peer-focus:peer-invalid:text-red-500 peer-valid:text-green-600 transition-all text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3"
              >
                Email address
              </label>
            </div>
            <button
              type="submit"
              className="relative grid place-items-center w-full h-[3rem] rounded bg-green-500 text-white outline-0"
            >
              {loading ? (
                <div className="absolute animate-ping w-9 h-6 rounded-full bg-green-700"></div>
              ) : (
                <>Continue</>
              )}
            </button>

            <p>
              <Link
                className="block mt-5 py-2 text-center tracking-wide text-green-600"
                to="/login"
              >
                Back to Client
              </Link>
            </p>
          </form>
        </>
      )}
    </div>
  );
};

export default ForgotPass;
