// Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../components/page/InputField';
import SocialButton from '../components/page/SocialButton';
import { useModal } from './ModalContext';

const Login = ({ closeLoginModal }: { closeLoginModal: () => void }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const { setShowRegisterModal, setShowLoginModal, setShowForgotPasswordModal } = useModal(); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login data:', formData);
    // Authentication logic would go here
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Social login logic would go here
  };

  const handleRegisterClick = () => {
    closeLoginModal(); 
    setShowRegisterModal(true); 
  };

  const handleForgotPasswordClick = () => {
    closeLoginModal(); 
    setShowForgotPasswordModal(true); 
  };

  return (
    <div className="w-full flex flex-col justify-center p-8 md:p-10 lg:p-16 bg-white rounded-3xl">
      <div className="flex justify-end">
        {/* <img src="/pics/logo.png" alt="logo" className=" w-11 h-11 mb-10 " /> */}
        <p className="text-xs text-gray-600 mb-6">
          Not a member?{' '}
          <button onClick={handleRegisterClick} className="text-red-800 hover:text-red-600 font-medium">
            Sign up!
          </button>
        </p>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Hi, Welcome Back!</h1>
        <p className="text-gray-600 text-xs">Start your day with us.</p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 text-[11px] ">
          <SocialButton provider="google" text="Sign Up with Google" icon="bx bxl-google" />
          <SocialButton provider="facebook" text="Sign Up with Facebook" icon="bx bxl-facebook" />
        </div>

        <div className="relative flex items-center justify-center">
          <div className="flex-grow border-t border-gray-500"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-xs">Or Sign in Email</span>
          <div className="flex-grow border-t border-gray-500"></div>
        </div>

        <form className="space-y-5 text-xs">
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
        </form>

        <Link to="/explore">
          <button className="relative w-full bg-red-900 text-white text-sm font-medium rounded-full px-5 py-2 -top-[10px] transition-all hover:bg-red-800">
            Login
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Login;
