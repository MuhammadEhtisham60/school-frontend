import React, { useEffect } from "react";
import { applyTheme, getSavedTheme } from "@/utils/themeManager";

const ThemeCustomization = ({ children }) => {
  useEffect(() => {
    applyTheme(getSavedTheme());
  }, []);

  return <>{children}</>;
};

export default ThemeCustomization;
