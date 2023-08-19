import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { UserContext } from "../context/userContext";

const Login = () => {
  const { setLoggedInUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (password.length < 8) return toast.error("Password too short");

      const data = { email, password };
      const res = await axios.post("/user/login", data);
      console.log(res);

      if (res.status === 224) {
        setLoggedInUser(res.data);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("error on line", error);
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    try {
      setLoading(true);

      if (!email) return toast.error("Enter email address");

      const data = { email };
      const res = await axios.post("/user/email_verify", data);
      console.log(res);

      if (res.status === 224) {
        setFoundUser(res.data);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("error in line21", error);
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-full grid place-items-center">
      <form className="w-[300px] sm:w-[340px] p-5" onSubmit={handleSubmit}>
        <h1 className="text-4xl text-center font-bold mb-9">Welcome back</h1>
        {foundUser?.userName ? (
          <>
            <div className="w-full text-center">
              <img
                src={foundUser.avatar}
                alt=""
                className="w-[60px] h-[60px] rounded-full mx-auto object-cover"
              />
              <h1 className="text-xl font-semibold mt-2">
                {foundUser.userName}
              </h1>
            </div>
          </>
        ) : (
          <>
            <div className="relative tracking-wide">
              <input
                type="email"
                id="email"
                required
                className="peer  border border-gray-300 focus:invalid:border-red-500 valid:border-green-500 rounded outline-0 block w-full h-[3rem] my-5 px-4 placeholder:text-transparent"
                placeholder="Email address"
                onChange={(e) => setEmail(e.target.value)}
              />
              <label
                htmlFor="email"
                className="absolute left-3 -top-3 peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm bg-white px-1 peer-focus:peer-invalid:text-red-500 peer-valid:text-green-600 transition-all text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3"
              >
                Email address
              </label>
            </div>
          </>
        )}

        {foundUser ? (
          <>
            <div className="relative tracking-wide">
              <input
                type="password"
                id="password"
                required
                minLength={8}
                className="peer border focus:invalid:border-red-500 valid:border-green-500 rounded outline-0 block w-full h-[3rem] my-5 px-4 placeholder:text-transparent"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
              <label
                htmlFor="paassword"
                className="absolute left-3 -top-3 peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm bg-white px-1 peer-focus:peer-invalid:text-red-500 peer-valid:text-green-600 transition-all text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3"
              >
                Password
              </label>
            </div>

            <Link
              to="/forgot_password"
              className="block w-full text-green-600 mb-5"
            >
              Forgot password?
            </Link>

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
          </>
        ) : (
          <>
            <Link
              onClick={handleVerify}
              className="relative grid place-items-center w-full h-[3rem] py-3 text-white bg-green-500 text-center rounded"
            >
              {loading ? (
                <div className="absolute animate-ping w-9 h-6 rounded-full bg-green-700"></div>
              ) : (
                <>Continue</>
              )}
            </Link>
          </>
        )}

        <p className="mt-5 py-2 text-center tracking-wide">
          Don't have an account?{" "}
          <Link className="text-green-600" to="/signup">
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
