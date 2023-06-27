import '../styles/globals.css';
import '../styles/fonts.css';
import { SessionProvider, useSession } from 'next-auth/react';
import { StoreProvider } from '../utils/Store';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import AgeVerificationModal from '../components/AgeVerificationModal';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const [isOldEnough, setIsOldEnough] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const age = localStorage.getItem('age-verified');
    if (age) {
      setIsOldEnough(true);
    } else {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem('age-verified', 'true');
    setIsOldEnough(true);
    setShowModal(false);
  };

  const handleReject = () => {
    window.location.href = 'https://www.google.com';
  };

  return (
    <SessionProvider session={session}>
      <StoreProvider>
        {Component.auth ? (
          <Auth adminOnly={Component.auth.adminOnly}>
            <Component {...pageProps} />
            {showModal && !isOldEnough && <AgeVerificationModal onConfirm={handleConfirm} onReject={handleReject} />}
          </Auth>
        ) : (
          <>
            <Component {...pageProps} />
            {showModal && !isOldEnough && <AgeVerificationModal onConfirm={handleConfirm} onReject={handleReject} />}
          </>
        )}
      </StoreProvider>
    </SessionProvider>
  );
}

function Auth({ children, adminOnly }) {
  const router = useRouter();
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/unauthorized?message=login required');
    }
  });
  if (status === 'loading') {
    return <div>Loading...</div>
  }
  if (adminOnly && !session.user.isAdmin) {
    router.push('/unauthorized?message=admin login required');
  }
  return children
}

export default MyApp;