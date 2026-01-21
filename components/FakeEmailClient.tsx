import React from 'react';

interface FakeEmailClientProps {
  isOpen: boolean;
  onClose: () => void;
  to: string;
  code: string;
}

const XIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const InboxIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;


const FakeEmailClient: React.FC<FakeEmailClientProps> = ({ isOpen, onClose, to, code }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-client-title"
    >
      <div
        className="relative bg-dark-900 border border-dark-700 rounded-xl shadow-2xl w-full max-w-lg m-8 animate-slide-up-email"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-dark-800 rounded-t-xl border-b border-dark-700">
            <div className="flex items-center gap-3">
                <InboxIcon className="w-6 h-6 text-primary" />
                <h2 id="email-client-title" className="text-xl font-bold text-gray-100">Simulated Inbox</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:text-white hover:bg-dark-700">
                <XIcon className="w-5 h-5" />
            </button>
        </div>
        
        {/* Email Content */}
        <div className="p-6">
            <div className="mb-4">
                <p className="text-sm text-gray-400">From: <span className="text-gray-200 font-medium">UPSC Framework AI &lt;no-reply@example.com&gt;</span></p>
                <p className="text-sm text-gray-400">To: <span className="text-gray-200 font-medium">{to}</span></p>
                <p className="text-sm text-gray-400">Subject: <span className="text-gray-200 font-bold">Your Verification Code</span></p>
            </div>

            <div className="border-t border-dark-700 pt-4 mt-4">
                <p className="text-gray-300 mb-6">Hello,</p>
                <p className="text-gray-300 mb-6">Your verification code is below. Please use it to complete your registration.</p>
                
                <div className="text-center my-8">
                    <p className="text-lg text-gray-400 mb-2">Verification Code</p>
                    <div 
                        className="inline-block px-10 py-4 font-mono text-4xl font-bold tracking-widest text-primary bg-dark-800 border-2 border-dashed border-primary/50 rounded-lg"
                        aria-label={`Verification code: ${code.split('').join(' ')}`}
                    >
                        {code}
                    </div>
                </div>

                <p className="text-sm text-gray-500">If you did not request this code, you can safely ignore this message.</p>
            </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-dark-800 rounded-b-xl border-t border-dark-700 text-center">
            <button
                onClick={onClose}
                className="px-6 py-2 font-semibold rounded-md text-black bg-primary hover:bg-cyan-300 transition-colors"
            >
                Close Inbox
            </button>
        </div>

      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up-email { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-up-email { animation: slide-up-email 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default FakeEmailClient;
