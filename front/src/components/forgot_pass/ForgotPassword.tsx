import React, { useState } from 'react';
import { KeyRound } from "lucide-react";
import { useModal } from '../../context/ModalContext';

// Custom OTP input field component
const OtpInput = ({ value, onChange }: { value: string[], onChange: (otp: string[]) => void }) => {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (val.length <= 1 && /^[0-9]*$/.test(val)) {
      const newOtp = [...value];
      newOtp[index] = val;
      onChange(newOtp);
      
      // Auto-focus next input
      if (val && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (/^\d{4}$/.test(pastedData)) {
      const digits = pastedData.split('');
      onChange(digits);
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          className="w-14 h-14 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-900"
          type="text"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={i === 0 ? handlePaste : undefined}
        />
      ))}
    </div>
  );
};

type ForgotPasswordStep = 'email' | 'verification' | 'newPassword' | 'success';

const ForgotPassword = ({ closeForgotPasswordModal }: { closeForgotPasswordModal: () => void }) => {
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { setShowLoginModal } = useModal();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    console.log(`Password reset requested for email: ${email}`);
    // In a real app, send request to the backend
    setCurrentStep('verification');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setError('Please enter the complete verification code');
      return;
    }
    setError('');
    console.log(`Verification code submitted: ${otpValue}`);
    // In a real app, verify OTP with the backend
    setCurrentStep('newPassword');
  };

  const handleResendCode = () => {
    console.log(`Resending verification code to: ${email}`);
    // In a real app, call API to resend code
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    console.log('Password reset successfully');
    // In a real app, send new password to the backend
    setCurrentStep('success');
  };

  const backToLogin = () => {
    closeForgotPasswordModal();
    setShowLoginModal(true);
  };

  const renderEmailForm = () => (
    <div className="flex flex-col items-center">
      <div className="border border-gray-300 p-2 rounded-full mb-6">
      <i className="bx bx-fingerprint"></i>
      </div>
      
      <h1 className="text-2xl font-bold mb-2">Forgot Password</h1>
      <p className="text-xs text-center text-gray-600 mb-8">
        Enter your email address and we will send a link to reset your password.
      </p>
      
      <form onSubmit={handleEmailSubmit} className="w-full">
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              className="w-full px-10 py-2 text-[13px] border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-300"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="absolute inset-y-0 left-3 flex items-center">
              <i className="bx bx-at text-gray-500"></i>
            </div>
          </div>
          {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-red-900 text-white text-sm font-medium py-3 rounded-full hover:bg-red-800 transition-colors mb-4"
        >
          Reset password
        </button>
        
        <button 
          type="button"
          onClick={backToLogin}
          className="w-full text-gray-600 text-xs py-2 hover:text-red-900 transition-colors"
        >
          <i className="bx bx-arrow-back mr-2"></i>
          Back to login
        </button>
      </form>
    </div>
  );

  const renderVerificationForm = () => (
    <div className="flex flex-col items-center">
      <div className="border border-gray-300 p-2 rounded-full mb-6">
      <i className="bx bx-envelope-open"></i>
    </div>
      
      <h1 className="text-2xl font-bold mb-2">Password Reset</h1>
      <p className="text-xs text-center text-gray-600 mb-8">
        We sent a code to <span className="font-[600] text-gray-900">{email}</span>
      </p>
      
      <form onSubmit={handleVerifyOtp} className="w-full">
        <div className="mb-6">
          <OtpInput value={otp} onChange={setOtp} />
          {error && <p className="text-red-600 text-xs mt-2 text-center">{error}</p>}
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-red-900 text-white text-sm font-medium py-3 rounded-full hover:bg-red-800 transition-colors mb-4"
        >
          Confirm
        </button>
        
        <p className="text-xs text-center mb-4">
          Didn't receive the email? <button onClick={handleResendCode} className="text-red-900 underline font-medium">Click to resend</button>
        </p>


        <button 
          type="button"
          onClick={backToLogin}
          className="w-full text-gray-600 text-xs py-2 hover:text-red-900 transition-colors"
        >
          <i className="bx bx-arrow-back mr-2"></i>
          Back to login
        </button>
        
      </form>
    </div>
  );

  const renderNewPasswordForm = () => (
    <div className="flex flex-col items-center">
      <div className="border border-gray-300 p-2 rounded-full mb-6">
        <KeyRound className="w-5 h-5 text-gray-600" />
      </div>
      
      <h1 className="text-2xl font-bold mb-2">Set new password</h1>
      <p className="text-xs text-center text-gray-600 mb-8">
        Must be at least 8 characters.
      </p>
      
      <form onSubmit={handlePasswordSubmit} className="w-full">
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full px-10 py-2 text-[13px] border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-300"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="absolute inset-y-0 left-3 flex items-center">
              <i className="bx bx-lock-alt text-gray-500"></i>
            </div>

            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={showPassword ? "bx bx-hide" : "bx bx-show"} style={{ fontSize: "18px" }}></i>
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className="w-full px-10 py-2 text-[13px] border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-300"
              placeholder="Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="absolute inset-y-0 left-3 flex items-center">
              <i className="bx bx-lock-alt text-gray-500"></i>
            </div>

            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <i className={showConfirmPassword ? "bx bx-hide" : "bx bx-show"} style={{ fontSize: "18px" }}></i>
            </button>
          </div>
          {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-red-900 text-white text-sm font-medium py-3 rounded-full hover:bg-red-800 transition-colors mb-4"
        >
          Reset password
        </button>
        
        <button 
          type="button"
          onClick={backToLogin}
          className="w-full text-gray-600 text-xs py-2 hover:text-red-900 transition-colors"
        >
          <i className="bx bx-arrow-back mr-2"></i>
          Back to login
        </button>
      </form>
    </div>
  );

  const renderSuccessMessage = () => (
    <div className="flex flex-col items-center">
      <div className="mb-2">
        <i className="bx bx-check-circle text-xl"></i>
      </div>
      
      <h1 className="text-2xl font-bold mb-2 text-red-900">All done !</h1>
      <p className="text-sm text-center mb-8">
        Your password has been reset.
      </p>
      
      <button 
        type="button"
        onClick={backToLogin}
        className="w-full text-gray-600 text-xs py-2 hover:text-red-900 transition-colors"
      >
        <i className="bx bx-arrow-back mr-2"></i>
        Back to login
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto p-8">
      {currentStep === 'email' && renderEmailForm()}
      {currentStep === 'verification' && renderVerificationForm()}
      {currentStep === 'newPassword' && renderNewPasswordForm()}
      {currentStep === 'success' && renderSuccessMessage()}
    </div>
  );
};

export default ForgotPassword;