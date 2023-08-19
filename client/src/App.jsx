import React, { useContext, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserContext } from "./context/userContext";
// import { toast } from 'react-toastify'
import axios from "axios";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound404 from "./pages/NotFound404";

axios.defaults.baseURL = "https://user-auth-u5y8.onrender.com";
axios.defaults.withCredentials = true;

const App = () => {
  const { loggedInUser, setLoggedInUser } = useContext(UserContext);

  const getCurrentLoggedInUser = async () => {
    try {
      const res = await axios("/current_loggedInUser");
      console.log(res);
      if (res.status === 224) {
        setLoggedInUser(res.data);
      }
    } catch (error) {
      console.error("error on line18", error);
    }
  };
  useEffect(() => {
    getCurrentLoggedInUser();
  }, []);
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            loggedInUser?.id ? (
              <Home {...loggedInUser} />
            ) : (
              <Navigate to={"/login"} />
            )
          }
        />
        <Route
          path="/login"
          element={loggedInUser?.id ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={loggedInUser?.id ? <Navigate to="/" /> : <Signup />}
        />
        <Route path="/forgot_password" element={<ForgotPassword />} />
        <Route path="/u/reset_password/:userId" element={<ResetPassword />} />
        <Route path="/*" element={<NotFound404 />} />
      </Routes>
    </Router>
  );
};

export default App;
