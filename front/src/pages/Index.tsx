import React, { useState, useEffect } from 'react';
import Navbar from '@/pages/Navbar';
import Hero from '@/pages/Hero';
import PopularArtists from '@/pages/PopularArtists';
import ExploreArtworks from '@/pages/ExploreArtworks';
import AuctionFeature from '@/pages/AuctionFeature';
import HotBidsCarousel from '@/pages/HotBidsCarousel';
import Footer from '@/pages/Footer';
import { useModal } from './ModalContext';
import Register from './Register';
import Login from './Login';
import ForgotPassword from '../components/forgot_pass/ForgotPassword'; 
import { X } from 'lucide-react';

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    showRegisterModal,
    setShowRegisterModal,
    showLoginModal,
    setShowLoginModal,
    showForgotPasswordModal, 
    setShowForgotPasswordModal, 
  } = useModal(); 

  const toggleBodyScroll = () => {
    if (showRegisterModal || showLoginModal || showForgotPasswordModal) {
      document.body.classList.add('overflow-hidden', 'h-screen');
    } else {
      document.body.classList.remove('overflow-hidden', 'h-screen');
    }
  };

  useEffect(() => {
    toggleBodyScroll();
    return () => {
      document.body.classList.remove('overflow-hidden', 'h-screen');
    };
  }, [showRegisterModal, showLoginModal, showForgotPasswordModal]);

  const modalContent = showRegisterModal ? (
    <Register closeRegisterModal={() => setShowRegisterModal(false)} />
  ) : showLoginModal ? (
    <Login closeLoginModal={() => setShowLoginModal(false)} />
  ) : showForgotPasswordModal ? ( 
    <ForgotPassword closeForgotPasswordModal={() => setShowForgotPasswordModal(false)} />
  ) : null;

  return (
    <>
      <Navbar />
      <Hero />
      <PopularArtists />
      <ExploreArtworks />
      <AuctionFeature />
      <HotBidsCarousel />
      <Footer />

      {/* Combined Modal */}
      {(showRegisterModal || showLoginModal || showForgotPasswordModal) && (  
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-3xl shadow-lg w-[500px] max-w-screen-sm relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowRegisterModal(false);
                setShowLoginModal(false);
                setShowForgotPasswordModal(false);
              }}
            >
              <X className="h-5 w-5" />
            </button>
            {modalContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Index;