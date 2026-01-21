import React, { useState, useCallback } from 'react';
import { askFollowUpQuestion } from '../services/geminiService';
import type { Source } from '../types';

const MessageSquarePlusIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="12" y1="7" x2="12" y2="13"/><line x1="9" y1="10" x2="15" y2="10"/></svg>;
const SearchIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const LinkIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>;
const SpinnerIcon: React.FC<{className?: string}> = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const XCircleIcon: React.FC<{className?: string}> = ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;


// A simple markdown parser to format the AI response
const FormattedResponse: React.FC<{ text: string }> = ({ text }) => {
    const html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .split('\n\n') // Split into paragraphs
        .map(paragraph => {
            // Check for lists
            if (paragraph.match(/^\s*[\*\-]\s/)) {
                const listItems = paragraph.split('\n').map(item => 
                    item.replace(/^\s*[\*\-]\s*(.*)/, `<li class="relative pl-5 before:content-['•'] before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-primary/80 before:rounded-full">$1</li>`)
                ).join('');
                return `<ul class="space-y-2">${listItems}</ul>`;
            }
            return `<p>${paragraph.replace(/\n/g, '<br/>')}</p>`; // Regular paragraph with line breaks
        })
        .join('');

    return <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: html }} />;
};

const GoDeepSection: React.FC<{ topic: string }> = ({ topic }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ answer: string; sources?: Source[] } | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await askFollowUpQuestion(topic, query);
      setResult(response);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [topic, query, isLoading]);

  const handleClear = () => {
    setQuery('');
    setResult(null);
    setError(null);
  }

  return (
    <div className="mt-12 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent-yellow rounded-xl blur opacity-30"></div>
        <div className="relative p-5 bg-dark-800/80 backdrop-blur-2xl border border-dark-700 rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                <div className="flex items-center gap-3">
                    <MessageSquarePlusIcon className="w-7 h-7 text-primary" />
                    <h3 className="text-2xl font-bold text-gray-100">Go Deep</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-500/50">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span>LIVE SEARCH</span>
                </div>
            </div>
            <p className="text-sm text-gray-400 mb-5">
                Ask a specific question about <strong className="text-gray-200">"{topic}"</strong> to get a real-time, search-grounded answer.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`e.g., What are the latest statistics on ${topic}?`}
                        className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-600 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-200 placeholder:text-gray-500 transition-all"
                        disabled={isLoading}
                        aria-label="Follow-up question"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-semibold rounded-md shadow-lg text-black bg-primary hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 focus:ring-primary disabled:bg-dark-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                    {isLoading ? (
                        <>
                            <SpinnerIcon className="animate-spin h-5 w-5 mr-3" />
                            Asking...
                        </>
                    ) : 'Ask AI'}
                </button>
            </form>

            <div className="mt-6" aria-live="polite">
                {isLoading && (
                     <div className="flex flex-col items-center justify-center p-6 text-center bg-dark-900/50 border border-dark-700 rounded-xl">
                        <SpinnerIcon className="w-8 h-8 text-primary animate-spin" />
                        <p className="mt-3 text-md text-gray-400">Searching the web for the latest information...</p>
                     </div>
                )}
                {error && <div className="p-4 bg-red-900/50 backdrop-blur-xl border border-red-500/50 text-red-300 rounded-xl" role="alert">{error}</div>}
                {result && (
                    <div className="p-5 bg-dark-900/50 border border-dark-700 rounded-xl space-y-4 animate-[fadeIn_0.5s_ease-in-out]">
                         <div className="flex justify-between items-center">
                            <h4 className="text-lg font-semibold text-gray-100">AI Response:</h4>
                            <button onClick={handleClear} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                                <XCircleIcon className="w-5 h-5"/>
                                Clear
                            </button>
                        </div>
                        <div className="text-gray-300 leading-relaxed">
                            <FormattedResponse text={result.answer} />
                        </div>

                        {result.sources && result.sources.length > 0 && (
                             <div>
                                 <div className="flex items-center gap-3 my-4 pt-4 border-t border-dark-700">
                                     <LinkIcon className="w-5 h-5 text-gray-400" />
                                     <h5 className="text-md font-semibold text-gray-200">Web Sources Used</h5>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                     {result.sources.map((source, i) => (
                                         <a href={source.web.uri} key={i} target="_blank" rel="noopener noreferrer" className="block bg-dark-800 p-3 rounded-lg border border-dark-600 transition-all duration-300 hover:border-primary/70 hover:bg-dark-700/50">
                                             <h6 className="font-semibold text-sm text-primary/90 truncate" title={source.web.title}>{source.web.title || source.web.uri}</h6>
                                             <p className="text-xs text-gray-500 truncate">{source.web.uri}</p>
                                         </a>
                                     ))}
                                 </div>
                             </div>
                        )}
                    </div>
                )}
            </div>
        </div>
        <style>{`
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
    </div>
  );
};

export default GoDeepSection;
