import React from 'react';

export const ConfigContext = React.createContext();

export const ConfigProvider = ({ children }) => {
  return (
    <ConfigContext.Provider value={{}}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => React.useContext(ConfigContext);
