import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

type View = 'LOG_IN' | 'SIGN_UP' | 'VERIFY_EMAIL';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (session: { email: string }) => void;
  onShowVerificationEmail: (email: string, code: string) => void;
}

const SpinnerIcon: React.FC<{className?: string}> = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const XIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const MailIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>;
const LockIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const HashIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>;
const InfoIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;


const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, onShowVerificationEmail }) => {
  const [view, setView] = useState<View>('LOG_IN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setTimeout(() => {
        setView('LOG_IN');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setVerificationCode('');
        setError(null);
        setIsLoading(false);
      }, 300); // Wait for closing animation
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const session = await authService.logIn(email, password);
      onAuthSuccess(session);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const { verificationCode } = await authService.signUp(email, password);
      onShowVerificationEmail(email, verificationCode);
      setView('VERIFY_EMAIL');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const session = await authService.confirmSignUp(email, verificationCode);
      onAuthSuccess(session);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderContent = () => {
    switch (view) {
      case 'SIGN_UP':
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-100 mb-1">Create Account</h2>
            <p className="text-center text-gray-400 mb-6">Start your personalized analysis journey.</p>
            <form onSubmit={handleSignUp} className="space-y-4">
              <InputWithIcon icon={<MailIcon />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required />
              <InputWithIcon icon={<LockIcon />} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
              <InputWithIcon icon={<LockIcon />} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm Password" required />
              <button type="submit" disabled={isLoading} className="w-full h-12 flex justify-center items-center font-semibold rounded-md text-black bg-primary hover:bg-cyan-300 disabled:bg-dark-600 disabled:cursor-not-allowed">
                {isLoading ? <SpinnerIcon className="animate-spin h-6 w-6" /> : 'Sign Up'}
              </button>
            </form>
            <p className="text-center mt-4 text-sm text-gray-400">
              Already have an account?{' '}
              <button onClick={() => { setView('LOG_IN'); setError(null); }} className="font-semibold text-primary hover:underline">Log In</button>
            </p>
          </>
        );

      case 'VERIFY_EMAIL':
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-100 mb-1">Verify Your Email</h2>
            <p className="text-center text-gray-400 mb-6">A 6-digit code was sent to <strong className="text-gray-200">{email}</strong>.</p>
            
            <div className="p-3 mb-4 bg-primary/10 border border-primary/50 text-primary/90 text-sm rounded-md flex items-start gap-3">
                <InfoIcon className="w-6 h-5 text-primary flex-shrink-0" />
                <div>
                    Check the <strong className="font-semibold">Simulated Inbox</strong> to find your verification code.
                </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <InputWithIcon icon={<HashIcon />} type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} placeholder="6-Digit Code" required />
              <button type="submit" disabled={isLoading} className="w-full h-12 flex justify-center items-center font-semibold rounded-md text-black bg-primary hover:bg-cyan-300 disabled:bg-dark-600 disabled:cursor-not-allowed">
                {isLoading ? <SpinnerIcon className="animate-spin h-6 w-6" /> : 'Verify & Continue'}
              </button>
            </form>
             <p className="text-center mt-4 text-sm text-gray-400">
              Didn't get a code?{' '}
              <button onClick={() => setView('SIGN_UP')} className="font-semibold text-primary hover:underline">Go back</button>
            </p>
          </>
        );

      case 'LOG_IN':
      default:
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-100 mb-1">Welcome Back</h2>
            <p className="text-center text-gray-400 mb-6">Log in to access your framework history.</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <InputWithIcon icon={<MailIcon />} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required />
              <InputWithIcon icon={<LockIcon />} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
              <button type="submit" disabled={isLoading} className="w-full h-12 flex justify-center items-center font-semibold rounded-md text-black bg-primary hover:bg-cyan-300 disabled:bg-dark-600 disabled:cursor-not-allowed">
                {isLoading ? <SpinnerIcon className="animate-spin h-6 w-6" /> : 'Log In'}
              </button>
            </form>
            <p className="text-center mt-4 text-sm text-gray-400">
              Don't have an account?{' '}
              <button onClick={() => { setView('SIGN_UP'); setError(null); }} className="font-semibold text-primary hover:underline">Sign Up</button>
            </p>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="relative bg-dark-800/90 backdrop-blur-2xl border border-dark-700 rounded-xl shadow-2xl w-full max-w-sm p-8 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-white hover:bg-dark-700">
          <XIcon className="w-5 h-5" />
        </button>
        {error && <p className="bg-red-900/50 border border-red-500 text-red-300 text-sm rounded-md p-3 mb-4 text-center">{error}</p>}
        {renderContent()}
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon: React.ReactNode;
}
const InputWithIcon: React.FC<InputWithIconProps> = ({ icon, ...props}) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500">{icon}</span>
        </div>
        <input
            {...props}
            className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-600 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-200 placeholder:text-gray-500 transition-all"
        />
    </div>
);

export default AuthModal;
