import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { makeRequest } from "../../../axios.js";
import "./navbar.css";

const Navbar = () => {
  const {
    user,
    loginWithPopup,
    isAuthenticated,
    logout,
    getAccessTokenSilently,
  } = useAuth0();
  const [showSignOut, setShowSignOut] = useState(false);
  useEffect(() => {
    const insertIntoDB = async () => {
      const token = await getAccessTokenSilently();
      try {
        const response = await makeRequest.post(
          "/user",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        console.log("User registered:", response.data);
      } catch (error) {
        console.error("Registration error:", error);
      }
    };
    if (isAuthenticated && user) {
      insertIntoDB();
    }
  }, [isAuthenticated, user, getAccessTokenSilently]);

  return (
    <div className="navbarContainer">
      <p className="rubisco">Rubisco Med Ed</p>
      {!isAuthenticated && (
        <button className="signInBtn" onClick={() => loginWithPopup()}>
          Sign In / Sign up
        </button>
      )}
      {isAuthenticated && (
        <div className="user">
          <div
            className="userInfo"
            onClick={() => setShowSignOut((showSignOut) => !showSignOut)}
          >
            <p className="username">{user.name}</p>
            <img src={user.picture} className="userImg" />
          </div>
          {showSignOut && (
            <button onClick={() => logout()} className="signOutBtn">
              Sign Out
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
