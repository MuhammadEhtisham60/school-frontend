import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetProfileQuery } from "@/services/private/profileService";
import { setCredentials, logout } from "@/store/slices/authSlice";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  // Check if we have a token in local storage or redux state
  const hasToken = !!(token || (typeof window !== "undefined" && localStorage.getItem("token")));

  const { data: profileData, error } = useGetProfileQuery(undefined, {
    skip: !hasToken,
  });

  useEffect(() => {
    if (profileData) {
      const storedToken = token || localStorage.getItem("token");
      const formattedUser = {
        ...profileData,
        role: profileData.role || "User",
        profile: {
          name:
            `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() ||
            profileData.email ||
            "User",
        },
      };

      dispatch(
        setCredentials({
          token: storedToken,
          user: formattedUser,
        }),
      );
    }
  }, [profileData, token, dispatch]);

  useEffect(() => {
    if (error) {
      // If token is invalid/expired (unauthorized), clean storage and log out
      if (error.status === 401 || error.status === 403) {
        dispatch(logout());
      }
    }
  }, [error, dispatch]);

  return <>{children}</>;
};

export default AuthInitializer;
