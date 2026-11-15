import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetProfileQuery } from "@/services/private/profileService";
import {
  setCredentials,
  logout,
  isTokenValid,
  getTokenExpiryMs,
} from "@/store/slices/authSlice";
import { toast } from "sonner";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const validToken = isTokenValid(token);

  useEffect(() => {
    if (token && !validToken) {
      dispatch(logout());
    }
  }, [token, validToken, dispatch]);

  // Schedule auto-logout when the 24-hour JWT token expires
  useEffect(() => {
    if (!token || !validToken) return;
    const expiryMs = getTokenExpiryMs(token);
    if (!expiryMs) return;

    const remainingMs = expiryMs - Date.now();
    if (remainingMs <= 0) {
      dispatch(logout());
      toast.error("Your 24-hour session has expired. Please sign in again.");
      return;
    }

    const timer = setTimeout(() => {
      dispatch(logout());
      toast.error("Your 24-hour session has expired. Please sign in again.");
    }, Math.min(remainingMs, 2147483647));

    return () => clearTimeout(timer);
  }, [token, validToken, dispatch]);

  const { data: profileData, error } = useGetProfileQuery(undefined, {
    skip: !validToken,
  });

  useEffect(() => {
    if (profileData && validToken) {
      const formattedUser = {
        ...profileData,
        role: profileData.role || "Super Admin",
        isSuperuser: !!profileData.isSuperuser,
        permissions: profileData.permissions || (profileData.isSuperuser ? ["*"] : []),
        profile: {
          name:
            `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim() ||
            profileData.email ||
            "User",
        },
      };

      dispatch(
        setCredentials({
          token,
          user: formattedUser,
        }),
      );
    }
  }, [profileData, token, validToken, dispatch]);

  useEffect(() => {
    if (error && (error.status === 401 || error.status === 403)) {
      dispatch(logout());
    }
  }, [error, dispatch]);

  return <>{children}</>;
};

export default AuthInitializer;
