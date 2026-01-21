import React, { useState } from 'react';

interface CollapsibleCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-700 rounded-xl shadow-lg mb-4 overflow-hidden transition-all duration-300 group hover:border-primary">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg"
      >
        <div className="flex items-center gap-4 text-gray-100">
            <div className="text-primary">{icon}</div>
            <span>{title}</span>
        </div>
        <ChevronDownIcon className={`w-6 h-6 text-gray-500 transition-transform duration-300 group-hover:text-primary ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
            <div className="p-5 border-t border-dark-700/80 text-gray-300">
                {children}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleCard;