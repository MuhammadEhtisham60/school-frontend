import React, { useEffect } from "react";
import {
  applyTheme,
  getSavedTheme,
  applyColorMode,
  getSavedColorMode,
} from "@/utils/themeManager";

const ThemeCustomization = ({ children }) => {
  useEffect(() => {
    applyTheme(getSavedTheme());
    applyColorMode(getSavedColorMode());
  }, []);

  return <>{children}</>;
};

export default ThemeCustomization;
