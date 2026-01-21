
import React from 'react';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: string[];
  onSelectTopic: (topic: string) => void;
  onClearHistory: () => void;
  isLoading: boolean;
}

const HistoryIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;
const TrashIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const XIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;


const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, history, onSelectTopic, onClearHistory, isLoading }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-dark-800/90 backdrop-blur-xl border-l border-dark-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-title"
      >
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-700">
                <div className="flex items-center gap-3">
                    <HistoryIcon className="w-6 h-6 text-primary" />
                    <h2 id="history-title" className="text-xl font-semibold text-gray-100">Generation History</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full text-gray-400 hover:text-primary hover:bg-dark-700 transition-colors duration-200"
                    aria-label="Close history"
                >
                    <XIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-4">
                {history.length > 0 ? (
                    <ul className="space-y-2">
                        {history.map((topic, index) => (
                            <li key={index}>
                                <button
                                    onClick={() => {
                                        onSelectTopic(topic);
                                        onClose();
                                    }}
                                    disabled={isLoading}
                                    className="w-full text-left p-3 bg-dark-900 rounded-md border border-dark-600 hover:border-primary/70 hover:bg-dark-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-gray-200">{topic}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center text-gray-400 pt-10">
                        <HistoryIcon className="w-12 h-12 mx-auto mb-4" />
                        <p className="font-semibold">No History Yet</p>
                        <p className="text-sm">Generate a framework to start your history.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
                <div className="p-4 border-t border-dark-700">
                    <button
                        onClick={onClearHistory}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/40 border border-red-500/50 text-red-300 rounded-md hover:bg-red-900/70 hover:text-red-200 transition-all duration-200"
                    >
                        <TrashIcon className="w-5 h-5" />
                        <span>Clear History</span>
                    </button>
                </div>
            )}
        </div>
      </aside>
    </>
  );
};

export default HistorySidebar;
