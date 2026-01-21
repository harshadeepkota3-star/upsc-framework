import React, { useState } from 'react';

interface CopyButtonProps {
  textToCopy: string;
}

const ClipboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 6 9 17l-5-5"/>
    </svg>
);


const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err)
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 ${copied ? 'bg-primary/20 border-primary text-primary focus:ring-primary' : 'bg-dark-700/50 border-dark-600 text-gray-300 hover:bg-dark-700 hover:border-primary/70 focus:ring-primary'}`}
    >
      {copied ? (
          <>
            <CheckIcon className="h-5 w-5 mr-2" />
            Copied!
          </>
      ) : (
          <>
            <ClipboardIcon className="h-5 w-5 mr-2" />
            Copy Framework
          </>
      )}
    </button>
  );
};

export default CopyButton;