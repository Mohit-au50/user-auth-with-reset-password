import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

const ResetPass = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [loading, setLoading] = useState(false);
  const [isAuthor, setIsAuthor] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChanged, setPasswordChanged] = useState(false);

  useEffect(() => {
    // extract the headers
    const urlSearchParams = new URLSearchParams(window.location.search);
    const headersJson = urlSearchParams.get("headers");
    if (headersJson) {
      setIsAuthor(headersJson);
    } else {
      navigate("/headersNotFound");
    }
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (password !== confirmPassword) {
        toast.error("both field should match");
        return;
      }

      const data = { userId, isAuthor, password, confirmPassword };
      const res = await axios.put("/user/update_password", data);
      console.log(res);

      if (res.status === 224) {
        setPasswordChanged(true);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.error("dbksdbksbdkb", error);
      navigate(`/${error?.response.data.message}`);
    }
    setLoading(false);
  };

  return (
    <>
      {isAuthor && (
        <>
          <div className="h-screen w-full grid place-items-center">
            {passwordChanged ? (
              <>
                <div className="w-[300px] sm:w-[340px] p-5">
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="#48bb78"
                      className="w-20 h-20 mx-auto my-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h1 className="text-3xl text-center font-bold mb-5">
                    Password Changed!
                  </h1>
                  <p className="text-sm text-center mb-7">
                    Your password has been changed successfully.
                  </p>
                  <button className="w-full h-[3rem] rounded bg-green-500 text-white outline-0">
                    <Link to="/">Back to Client</Link>
                  </button>
                </div>
              </>
            ) : (
              <>
                <form
                  onSubmit={handleResetPassword}
                  className="w-[300px] sm:w-[340px] p-5"
                >
                  <h1 className="text-3xl text-center font-bold mb-5">
                    Reset your password
                  </h1>
                  <p className="text-sm text-center mb-7">
                    Enter a new password below to change your password.
                  </p>

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
                      New password
                    </label>
                  </div>

                  <div className="relative tracking-wide">
                    <input
                      type="password"
                      id="confirmPassword"
                      required
                      minLength={8}
                      className="peer border focus:invalid:border-red-500 valid:border-green-500 rounded outline-0 block w-full h-[3rem] my-5 px-4 placeholder:text-transparent"
                      placeholder="Password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <label
                      htmlFor="confirmPassword"
                      className="absolute left-3 -top-3 peer-focus:-top-3 peer-focus:left-3 peer-focus:text-sm bg-white px-1 peer-focus:peer-invalid:text-red-500 peer-valid:text-green-600 transition-all text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3"
                    >
                      Confirm new Password
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-[3rem] rounded bg-green-500 text-white outline-0"
                  >
                    {loading ? (
                      <div className="absolute animate-ping w-9 h-6 rounded-full bg-green-700"></div>
                    ) : (
                      <>Reset password</>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ResetPass;
