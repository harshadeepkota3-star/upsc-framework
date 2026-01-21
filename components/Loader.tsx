import React from 'react';

const AshokaChakraIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
    <svg className={className} style={style} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4"/>
        <circle cx="50" cy="50" r="8" fill="currentColor"/>
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            {[...Array(24)].map((_, i) => (
                <line key={i} x1="50" y1="50" x2="50" y2="10" transform={`rotate(${i * 15}, 50, 50)`} />
            ))}
        </g>
    </svg>
);


const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-dark-800/50 backdrop-blur-xl border border-white/10 rounded-xl">
      <div className="relative">
        <AshokaChakraIcon className="w-20 h-20 text-primary animate-spin" style={{ animationDuration: '3s' }} />
      </div>
      <h3 className="mt-6 text-xl font-semibold text-gray-100">Generating Universal Framework...</h3>
      <p className="mt-2 text-md text-gray-400">AI is constructing the analytical model. Please wait.</p>
    </div>
  );
};

export default Loader;