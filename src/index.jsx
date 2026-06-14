import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

// styles
import './index.css';

// project-imports
import App from './App';
import { ConfigProvider } from '@/contexts/ConfigContext';
import reportWebVitals from './reportWebVitals';
import { store } from '@/store';
import { GoogleOAuthProvider } from '@react-oauth/google';

const container = document.getElementById('root');
const root = createRoot(container);
const client_id = "656633822250-4kbc3o3sjda7p0a6afb55ui71asln0ef.apps.googleusercontent.com"

// ==============================|| MAIN - REACT DOM RENDER ||============================== //

root.render(
  <Provider store={store}>
    <ConfigProvider>
      <GoogleOAuthProvider clientId={client_id}>
        <App />
      </GoogleOAuthProvider>
    </ConfigProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
