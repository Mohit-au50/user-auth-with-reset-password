import React, { useContext, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../context/userContext";

const Signup = () => {
  const { setLoggedInUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("");

  const handleVerify = async () => {
    try {
      setLoading(true);
      if (!email) return toast.error("Enter email address");

      const data = { email };
      const res = await axios.post("/user/email_verify", data);
      console.log(res);

      if (res.status === 220) {
        setFoundUser(res.data);
      } else {
        toast.error("Email already exsits");
      }
    } catch (error) {
      console.error("error line:22", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (userName && email && avatar) {
      const reqData = new FormData();
      reqData.set("userName", userName);
      reqData.set("email", email);
      reqData.set("password", password);
      reqData.set("avatar", avatar);

      const res = await axios.post("/user/signup", reqData);
      console.log(res.data);

      if (res.status === 224) {
        toast.success("User Created");
        setLoggedInUser(res.data);
      } else {
        toast.warn(res.data.message);
      }
    } else {
      toast.error("Fill all fields");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="h-screen w-full grid place-items-center">
        <form
          className="w-[320px] sm:w-[340px] p-5 mx-auto"
          onSubmit={handleSubmit}
        >
          <h2 className="text-4xl text-center font-bold mb-9">
            Create your account
          </h2>

          {!foundUser && (
            <>
              <div className="relative tracking-wide">
                <input
                  type="email"
                  id="email"
                  required
                  className="peer border border-gray-300 focus:invalid:border-red-500 valid:border-green-500 rounded outline-0 block w-full h-[3rem] my-5 px-4 placeholder:text-transparent"
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

          {foundUser?.email ? (
            <>
              <div className="relative tracking-wide">
                <input
                  type="email"
                  id="email"
                  required
                  className="peer border invalid:border-red-500 valid:border-green-500 block w-full h-[3rem] rounded outline-0 my-5 px-4"
                  placeholder="Email address"
                  value={email}
                />
                <label
                  htmlFor="email"
                  className="absolute left-3 -top-3 bg-white px-1 peer-invalid:text-red-500 text-green-600 text-sm"
                >
                  Email address
                </label>
              </div>

              <div className="relative tracking-wide">
                <input
                  type="text"
                  id="username"
                  required
                  className="peer border rounded valid:border-green-500 outline-0 block w-full h-[3rem] my-5 px-4 placeholder:text-transparent"
                  placeholder="Username"
                  onChange={(e) => setUserName(e.target.value)}
                />
                <label
                  htmlFor="username"
                  className="absolute left-3 -top-3 peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm bg-white px-1 text-green-600 transition-all text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3"
                >
                  Username
                </label>
              </div>

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
                  className="absolute left-3 -top-3 peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm bg-white px-1 peer-focus:peer-invalid:text-red-600 peer-valid:text-green-600 transition-all text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3"
                >
                  Password
                </label>
              </div>

              <input
                className="block w-full my-5 file:mr-5 file:px-4 file:py-1 file:rounded-full file:border-0 file:font-semibold file:bg-violet-50 file:text-violet-500 hover:file:bg-violet-100"
                type="file"
                required
                onChange={(e) => setAvatar(e.target.files[0])}
              />

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
            Alrady have an account?{" "}
            <Link className="text-green-600" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </>
  );
};

export default Signup;
