// Register.tsx
import React, { useState, useEffect, useRef } from 'react';
import Logo from '../components/page/Logo';
import InputField from '../components/page/InputField';
import SocialButton from '../components/page/SocialButton';
import { useModal } from './ModalContext';

const Register = ({ closeRegisterModal }: { closeRegisterModal: () => void }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const { setShowRegisterModal, setShowLoginModal, setShowForgotPasswordModal } = useModal(); // Get setShowForgotPasswordModal

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registration data:', formData);
    // Registration logic would go here
    closeRegisterModal(); // Close register modal
    setShowLoginModal(true); // Open login modal
  };

  const handleSocialRegister = (provider: string) => {
    console.log(`Register with ${provider}`);
    // Social registration logic would go here
  };

  const handleForgotPasswordClick = () => {
    closeRegisterModal(); // Close the register modal
    setShowForgotPasswordModal(true); // Show forgot password modal
  };

  return (
    <div className="w-full flex flex-col justify-center md:p-6 lg:py-5 lg:px-16 bg-white rounded-3xl">
      <div className="flex justify-end">
        {/* <img src="/pics/logo.png" alt="logo" className="w-11 h-11" /> */}
        <p className="relative top-5 text-xs text-gray-600 mb-10">
          Already a member?{' '}
          <button
            onClick={() => {
              closeRegisterModal();
              setShowLoginModal(true);
            }}
            className="text-red-800 hover:text-red-600 font-medium"
          >
            Log in!
          </button>
        </p>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl text-center font-bold mb-2">Create new account.</h1>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 text-[11px]">
          <SocialButton provider="google" text="Sign Up with Google" icon="bx bxl-google" />
          <SocialButton provider="facebook" text="Sign Up with Facebook" icon="bx bxl-facebook" />
        </div>

        <div className="relative flex items-center justify-center">
          <div className="flex-grow border-t border-gray-500"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-xs">Or Sign in Email</span>
          <div className="flex-grow border-t border-gray-500"></div>
        </div>

        <form className="space-y-5 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField type="text" label="First Name" placeholder="First name" icon="bx bx-user" />
            <InputField type="text" label="Last Name" placeholder="Last name" icon="bx bx-user" />
          </div>

          <InputField type="email" label="Email Address" placeholder="Email Address" icon="bx bx-at" />
          <InputField type="password" label="Password" placeholder="Password" icon="bx bx-lock-alt" />

          <div className="relative flex justify-between text-[11px] -top-20">
            <span></span>
            <button
              type="button"
              onClick={handleForgotPasswordClick}
              className="text-black hover:text-red-700"
            >
              Forgot Password?
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="relative w-full bg-red-900 text-white text-sm font-medium rounded-full px-5 py-2 -top-[27px] transition-all hover:bg-red-800"
          >
            Create account
          </button>

          <p className="relative text-[10px] text-left text-gray-500 -top-8">
            By signing up, I agree to the{' '}
            <a href="#" className="underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline">
              Privacy Policy
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
