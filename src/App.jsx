import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { useEffect, useState } from 'react';

import routes from '@/routes';
import ThemeCustomization from '@/themes';
import Locales from '@/components/Locales';
import FullScreenLoader from '@/components/FullScreenLoader';
import AuthInitializer from '@/components/AuthInitializer';

export default function App() {
  const [loading, setLoading] = useState(true);
  const pathname = window.location.pathname;
  const isGptPage = pathname.startsWith('/assistant');
  const isWebsiteBuilder = pathname.startsWith('/website-builder');

  // Create router using the React Router configuration
  const router = useMemo(() => {
    return createBrowserRouter(routes);
  }, []);

  // Show loader on initial app load (only for website pages, not GPT or Builder pages)
  useEffect(() => {
    if (isGptPage || isWebsiteBuilder) {
      // Skip loader for GPT and Builder pages
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200); // fake loading

    return () => clearTimeout(timer);
  }, [isGptPage, isWebsiteBuilder]);

  return (
    <>
      {loading && !isGptPage && !isWebsiteBuilder && <FullScreenLoader />}

      <AuthInitializer>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          autoHideDuration={3000}
          style={{ zIndex: 4500 }}
        >
          <ThemeCustomization>
            <Locales>
              <RouterProvider router={router} />
            </Locales>
          </ThemeCustomization>
        </SnackbarProvider>
      </AuthInitializer>
    </>
  );
}

