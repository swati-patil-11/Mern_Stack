import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser
} from "../api/api.js";


const AuthContext =
  createContext();


export const AuthProvider = ({
  children
}) => {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  // ==================================
  // LOAD USER WHEN APP STARTS
  // ==================================

  useEffect(() => {

    const token =
      localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((response) => {

        setUser(
          response.data.user
        );

      })
      .catch(() => {

        localStorage.removeItem(
          "token"
        );

        setUser(null);

      })
      .finally(() => {

        setLoading(false);

      });

  }, []);


  // ==================================
  // LOGIN
  // ==================================

  const login = async (
    email,
    password
  ) => {

    const response =
      await loginUser({
        email,
        password
      });

    const {
      token,
      user
    } = response.data;

    localStorage.setItem(
      "token",
      token
    );

    setUser(user);

    return response.data;
  };


  // ==================================
  // REGISTER
  // ==================================

  const register = async (
    userData
  ) => {

    const response =
      await registerUser(
        userData
      );

    const {
      token,
      user
    } = response.data;

    localStorage.setItem(
      "token",
      token
    );

    setUser(user);

    return response.data;
  };


  // ==================================
  // LOGOUT
  // ==================================

  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    setUser(null);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated:
          !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {

  return useContext(
    AuthContext
  );

};