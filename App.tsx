

import React, { useState, useCallback, useEffect } from 'react';
import type { FrameworkData, PrelimsQuestion, MainsQuestion, MultiDimPoint, PYQ, InterviewQuestion, Source } from './types';
import { generateFramework } from './services/geminiService';
import { authService } from './services/authService';
import CollapsibleCard from './components/CollapsibleCard';
import Loader from './components/Loader';
import CopyButton from './components/CopyButton';
import GoDeepSection from './components/GoDeepSection';
import HistorySidebar from './components/HistorySidebar';
import AuthModal from './components/AuthModal';
import FakeEmailClient from './components/FakeEmailClient';

// --- SVG Icons ---
const AshokaChakraIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4"/>
        <circle cx="50" cy="50" r="8" fill="currentColor"/>
        <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            {[...Array(24)].map((_, i) => (
                <line key={i} x1="50" y1="50" x2="50" y2="10" transform={`rotate(${i * 15}, 50, 50)`} />
            ))}
        </g>
    </svg>
);
const SearchIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const KnowledgeIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const MultiDimIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line><line x1="3" y1="12" x2="21" y2="12"></line></svg>;
const PrelimsIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4"/><path d="M5 12h14"/><path d="M5 17h14"/><path d="M5 7h14"/></svg>;
const MainsIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const InterviewIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const TargetIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const BrainIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7h-3A2.5 2.5 0 0 1 4 4.5v0A2.5 2.5 0 0 1 6.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v0A2.5 2.5 0 0 1 14.5 7h-3a2.5 2.5 0 0 1-2.5-2.5v0A2.5 2.5 0 0 1 11.5 2Z"/><path d="M6 15.5A2.5 2.5 0 0 1 3.5 13v0A2.5 2.5 0 0 1 6 10.5h2a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 1 1 1v1a1 1 0 0 0 1 1h2a2.5 2.5 0 0 1 2.5 2.5v0a2.5 2.5 0 0 1-2.5 2.5h-8A2.5 2.5 0 0 1 6 15.5Z"/><path d="M18 15.5A2.5 2.5 0 0 0 15.5 13v0a2.5 2.5 0 0 0-2.5 2.5h-2a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1h-2A2.5 2.5 0 0 0 2.5 22v0a2.5 2.5 0 0 0 2.5-2.5h8a2.5 2.5 0 0 0 2.5-2.5Z"/></svg>;
const FileTextIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
const HistoryIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>;
const LightbulbIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.7 10.2 18 9 18 7c0-2.2-1.8-4-4-4S10 4.8 10 7c0 2 .3 3.2 1.5 4.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
const LinkIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/></svg>;
const LogOutIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const UserIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ShieldCheckIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const NewspaperIcon: React.FC<{className?:string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2V4"/><path d="M16 2v20"/><path d="M8 7h4"/><path d="M8 12h4"/><path d="M8 17h4"/></svg>;


// --- Components ---

const AppHeader: React.FC<{ 
    user: { email: string } | null;
    onToggleHistory: () => void;
    onLoginClick: () => void;
    onLogoutClick: () => void;
}> = ({ user, onToggleHistory, onLoginClick, onLogoutClick }) => (
    <header className="p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                <AshokaChakraIcon className="w-10 h-10 text-primary" />
                <div>
                    <h1 className="text-xl font-bold text-gray-100">UPSC Framework AI</h1>
                    <p className="text-sm text-gray-400">High-Fidelity Analysis for Civil Services</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {user ? (
                    <>
                        <div className="hidden sm:flex items-center gap-2 bg-dark-800/50 px-3 py-1.5 rounded-full border border-dark-700">
                           <UserIcon className="w-4 h-4 text-gray-400"/>
                           <span className="text-sm text-gray-300 font-medium">{user.email}</span>
                        </div>
                         <button
                            onClick={onToggleHistory}
                            className="p-2 rounded-full text-gray-400 hover:text-primary hover:bg-dark-700 transition-colors duration-200"
                            aria-label="Toggle generation history"
                        >
                            <HistoryIcon className="w-6 h-6" />
                        </button>
                        <button
                            onClick={onLogoutClick}
                            className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-dark-700 transition-colors duration-200"
                            aria-label="Logout"
                        >
                            <LogOutIcon className="w-6 h-6" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={onLoginClick}
                        className="px-4 py-2 text-sm font-semibold rounded-md text-black bg-primary hover:bg-cyan-300 transition-colors"
                    >
                       Login / Sign Up
                    </button>
                )}
            </div>
        </div>
    </header>
);

const TopicInput: React.FC<{
    onSubmit: (topic: string) => void;
    isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
    const [topic, setTopic] =useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim() && !isLoading) {
            onSubmit(topic.trim());
        }
    };

    return (
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent-yellow rounded-xl blur opacity-0 group-focus-within:opacity-75 transition duration-500 group-hover:opacity-50"></div>
            <form onSubmit={handleSubmit} className="relative p-6 bg-dark-800/80 backdrop-blur-lg border border-dark-700 rounded-xl shadow-2xl">
                <label htmlFor="topic-input" className="block text-sm font-medium text-gray-300 mb-2">
                    Enter Topic for AI Framework Generation
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                            id="topic-input"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Uniform Civil Code, India-US relations..."
                            className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-600 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary text-gray-200 placeholder:text-gray-500 transition-all"
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !topic.trim()}
                        className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-semibold rounded-md shadow-lg text-black bg-primary hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 focus:ring-primary disabled:bg-dark-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                        {isLoading ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const WelcomeScreen: React.FC<{ onLoginClick: () => void }> = ({ onLoginClick }) => (
    <div className="text-center p-8 bg-dark-800/50 backdrop-blur-xl border border-white/10 rounded-xl">
        <AshokaChakraIcon className="w-20 h-20 text-primary mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Unlock Your Potential</h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-6">
            Log in or create an account to access the AI Framework Generator and save your personalized analysis history.
        </p>
        <button
            onClick={onLoginClick}
            className="px-8 py-3 text-base font-semibold rounded-md shadow-lg text-black bg-primary hover:bg-cyan-300 transition-all duration-300 transform hover:scale-105"
        >
            Login / Sign Up
        </button>
    </div>
);


// --- Data Visualization Sub-Components ---

const Tag: React.FC<{ children: React.ReactNode; color?: 'cyan' | 'yellow' | 'orange' }> = ({ children, color = 'cyan' }) => {
    const colorClasses = {
        cyan: 'bg-primary/10 text-primary border-primary/50',
        yellow: 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/50',
        orange: 'bg-accent-orange/10 text-accent-orange border-accent-orange/50',
    };
    return (
        <div className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${colorClasses[color]}`}>
            {children}
        </div>
    );
};

const MultiDimCard: React.FC<{ title: string; data: MultiDimPoint }> = ({ title, data }) => (
    <div className="bg-dark-800/70 p-4 rounded-lg border border-dark-700 h-full flex flex-col">
        <h4 className="font-semibold text-gray-100 text-md mb-3">{title}</h4>
        <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm flex-grow">
            {data.points.map((point, i) => <li key={i}>{point}</li>)}
        </ul>
        <p className="mt-4 text-sm italic border-l-4 border-accent-yellow pl-3 py-1 bg-dark-900 text-yellow-200 rounded-r-md">
            <strong>Crux:</strong> {data.crux}
        </p>
    </div>
);

const PrelimsQuestionCard: React.FC<{ question: PrelimsQuestion; index: number }> = ({ question, index }) => (
    <div className="mb-6 pb-4 border-b border-dark-700 last:border-b-0 last:pb-0">
        <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-gray-200">Question {index + 1}</p>
            <Tag color="cyan">{question.type}</Tag>
        </div>
        <p className="font-semibold mb-3 text-gray-200 whitespace-pre-line">{question.question}</p>
        <div className="space-y-2 mb-4">
            {Object.entries(question.options).map(([key, value]) => (
                <div key={key} className={`p-3 rounded-md bg-dark-900 border transition-all duration-300 text-sm ${question.correctAnswer === key ? 'border-accent-yellow shadow-neon-yellow' : 'border-dark-600'}`}>
                    <span className="font-sans font-bold text-gray-400 mr-2">{key}.</span> {value}
                </div>
            ))}
        </div>
        <p className="mt-3 font-semibold text-base text-accent-yellow">
            Correct Answer: <span className="font-mono bg-dark-900 px-2 py-1 rounded">{question.correctAnswer}</span>
        </p>
    </div>
);

const MainsQuestionCard: React.FC<{ question: MainsQuestion; index: number }> = ({ question, index }) => (
    <div className="mb-8 pb-6 border-b border-dark-700 last:border-b-0 last:pb-0">
        <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-gray-200">Question {index + 1}</p>
            <Tag color="orange">{question.type}</Tag>
        </div>
        <p className="font-semibold text-lg mb-4 text-gray-200">{question.question}</p>
        <h4 className="font-medium text-sm text-gray-400 mb-3">Answer Structure:</h4>
        <div className="relative border-l-2 border-primary/50 ml-2">
            {question.answerStructure.map((point, j) => (
                <div key={j} className="mb-4 pl-8 relative last:mb-0">
                    <div className="absolute left-[-11px] top-1 h-5 w-5 bg-dark-800 rounded-full border-2 border-primary flex items-center justify-center">
                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                    </div>
                    <p className="text-gray-300">{point}</p>
                </div>
            ))}
        </div>
    </div>
);

const FrameworkDisplay: React.FC<{
    data: FrameworkData;
    topic: string;
    handleGenerate: (topic: string) => void;
    isLoading: boolean;
    sources?: Source[];
}> = ({ data, topic, handleGenerate, isLoading, sources }) => {
    const generateTextForCopy = () => {
        let text = `UPSC FRAMEWORK FOR: ${topic.toUpperCase()}\n\n`;

        text += `BRIEFING\n${data.topicBrief}\n\n`;
        
        if (data.previousYearQuestions && data.previousYearQuestions.length > 0) {
            text += "PREVIOUS YEAR QUESTIONS (PYQs)\n";
            data.previousYearQuestions.forEach(q => {
                text += `(${q.year} - ${q.exam}) ${q.question}\n`;
            });
            text += "\n";
        }

        text += "1. WHAT YOU NEED TO KNOW\n";
        text += "Introduction:\n" + data.whatYouNeedToKnow.introduction.map(p => `- ${p}`).join('\n') + "\n";
        text += "Why Critical: " + data.whatYouNeedToKnow.whyThisIsCritical + "\n\n";

        if (data.liveNewsFeed && data.liveNewsFeed.length > 0) {
            text += "2. LIVE NEWS FEED\n";
            data.liveNewsFeed.forEach(article => {
                text += `- Title: ${article.title}\n  Source: ${article.source} (${article.publishedDate})\n  Summary: ${article.summary}\n\n`;
            });
        }

        text += "3. MULTI-DIMENSIONAL ANALYSIS\n";
        Object.entries(data.multiDimensionalAnalysis).forEach(([key, value]) => {
            const title = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            // FIX: Cast `value` to `MultiDimPoint` as `Object.entries` loses type information.
            const pointData = value as MultiDimPoint;
            text += `${title}:\n` + pointData.points.map(p => `- ${p}`).join('\n') + `\nCrux: ${pointData.crux}\n\n`;
        });
        
        if (data.sourceValidation && data.sourceValidation.validatedPoints.length > 0) {
            text += "4. SOURCE VALIDATION\n";
            text += `Summary: ${data.sourceValidation.summary}\n`;
            data.sourceValidation.validatedPoints.forEach(p => {
                text += `- Point: "${p.point}" | Source: ${p.source} | Status: ${p.verificationStatus}\n`;
            });
            text += "\n";
        }

        text += "5. PRELIMS QUESTIONS\n";
        data.prelimsQuestions.forEach((q, i) => {
            text += `Q${i+1} (${q.type}): ${q.question}\n` + Object.entries(q.options).map(([k,v]) => `${k}) ${v}`).join('\n') + `\n👉 Answer: ${q.correctAnswer}\n\n`;
        });
        
        text += "6. MAINS QUESTIONS\n";
        data.mainsQuestions.forEach((q, i) => {
            text += `Q${i+1} (${q.type}): ${q.question}\nStructure:\n` + q.answerStructure.map(p => `- ${p}`).join('\n') + `\n\n`;
        });

        text += "7. INTERVIEW QUESTIONS\n";
        data.interviewQuestions.forEach(q => {
            text += `Q (${q.type}): ${q.question}\n`;
            text += `A: ${q.answer}\n\n`;
        });

        text += "8. WHAT EXAMINER IS TESTING\n" + (data.whatExaminerIsTesting || []).map(p => `- ${p}`).join('\n') + "\n\n";
        text += "9. FINAL THOUGHTS\n" + data.finalThoughts + "\n\n";
        
        if (data.relatedTopics && data.relatedTopics.length > 0) {
            text += "RELATED TOPICS TO EXPLORE\n" + data.relatedTopics.join(', ') + "\n";
        }

        return text;
    };
    
    return (
        <div className="mt-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold text-gray-100">Framework: <span className="text-primary">{topic}</span></h2>
                <CopyButton textToCopy={generateTextForCopy()} />
            </div>

            {data.topicBrief && (
                <div className="p-5 mb-4 bg-dark-800/60 backdrop-blur-xl border border-dark-700 rounded-xl shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                        <FileTextIcon className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-semibold text-gray-100">Topic Brief</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{data.topicBrief}</p>
                </div>
            )}
            
            {sources && sources.length > 0 && (
                <div className="p-5 mb-4 bg-dark-800/60 backdrop-blur-xl border border-dark-700 rounded-xl shadow-lg animate-[fadeIn_0.5s_ease-in-out]">
                    <div className="flex items-center gap-3 mb-4">
                        <LinkIcon className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-semibold text-gray-100">Sources Consulted for this Framework</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sources.map((source, i) => (
                            <a href={source.web.uri} key={i} target="_blank" rel="noopener noreferrer" className="block bg-dark-900 p-3 rounded-lg border border-dark-600 transition-all duration-300 hover:border-primary/70 hover:bg-dark-800/50">
                                <h6 className="font-semibold text-sm text-primary/90 truncate" title={source.web.title}>{source.web.title || source.web.uri}</h6>
                                <p className="text-xs text-gray-500 truncate">{source.web.uri}</p>
                            </a>
                        ))}
                    </div>
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </div>
            )}

            <CollapsibleCard title="What You Need to Know" icon={<KnowledgeIcon className="w-6 h-6" />} defaultOpen>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg mb-2 text-gray-100">1.1 Introduction</h3>
                        <div className="space-y-3">
                            {data.whatYouNeedToKnow.introduction.map((item, i) => 
                                <p key={i} className="relative pl-5 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-primary/80 before:rounded-full">{item}</p>
                            )}
                        </div>
                    </div>
                    <div className="bg-dark-900 border-l-4 border-accent-orange p-4 rounded-r-md">
                        <h3 className="font-semibold text-lg mb-2 text-gray-100">1.2 Why This Is Critical</h3>
                        <p className="text-accent-orange/90">{data.whatYouNeedToKnow.whyThisIsCritical}</p>
                    </div>
                </div>
            </CollapsibleCard>

            {data.liveNewsFeed && data.liveNewsFeed.length > 0 && (
                <CollapsibleCard title="Live News Feed" icon={<NewspaperIcon className="w-6 h-6" />}>
                    <div className="space-y-4">
                        {data.liveNewsFeed.map((article, i) => (
                            <div key={i} className="p-4 bg-dark-900 rounded-lg border border-dark-700 transition-all duration-300 hover:border-primary/50">
                                <h4 className="font-semibold text-lg text-gray-100 mb-2">{article.title}</h4>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
                                    <span>Source: <strong className="text-gray-300 font-medium">{article.source}</strong></span>
                                    <span>Date: <strong className="text-gray-300 font-medium">{article.publishedDate}</strong></span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{article.summary}</p>
                            </div>
                        ))}
                    </div>
                </CollapsibleCard>
            )}

            {data.previousYearQuestions && data.previousYearQuestions.length > 0 && (
                <CollapsibleCard title="Previous Year Questions (PYQs)" icon={<HistoryIcon className="w-6 h-6" />}>
                     <div className="space-y-4">
                        {data.previousYearQuestions.map((pyq, i) => (
                            <div key={i} className="p-4 bg-dark-900 rounded-lg border border-dark-700">
                                <div className="flex justify-between items-center mb-2">
                                    <Tag color="yellow">{pyq.exam}</Tag>
                                    <span className="font-mono text-sm text-gray-400">{pyq.year}</span>
                                </div>
                                <p className="text-gray-200">{pyq.question}</p>
                            </div>
                        ))}
                    </div>
                </CollapsibleCard>
            )}

            <CollapsibleCard title="Multi-Dimensional Analysis" icon={<MultiDimIcon className="w-6 h-6" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <MultiDimCard title="Regulatory & Institutional" data={data.multiDimensionalAnalysis.regulatoryInstitutional} />
                    <MultiDimCard title="Governance & Policy" data={data.multiDimensionalAnalysis.governancePolicyFailure} />
                    <MultiDimCard title="Technical & Infrastructure" data={data.multiDimensionalAnalysis.technicalInfrastructure} />
                    <MultiDimCard title="Disaster, Security & Conflict" data={data.multiDimensionalAnalysis.disasterSecurityConflict} />
                    <MultiDimCard title="Economic & Global" data={data.multiDimensionalAnalysis.economicGlobalRepercussions} />
                    <MultiDimCard title="Social, Cultural & Ethical" data={data.multiDimensionalAnalysis.socialCulturalEthical} />
                </div>
            </CollapsibleCard>

            {data.sourceValidation && (
                <CollapsibleCard title="Source Validation" icon={<ShieldCheckIcon className="w-6 h-6" />}>
                    <div className="space-y-6">
                        <p className="italic text-gray-400 bg-dark-900/50 p-4 rounded-md border-l-4 border-primary shadow-md">
                            {data.sourceValidation.summary}
                        </p>
                        <div className="space-y-4">
                            {data.sourceValidation.validatedPoints.map((item, index) => (
                                <div key={index} className="bg-dark-900 p-4 rounded-lg border border-dark-700">
                                    <p className="font-semibold text-gray-200 mb-3">"<span className="italic">{item.point}</span>"</p>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-400">Source:</span>
                                            <span className="font-semibold text-gray-300">{item.source}</span>
                                        </div>
                                        <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-bold
                                            ${item.verificationStatus === 'Verified' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                                            item.verificationStatus === 'Partially Verified' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                            'bg-red-500/20 text-red-400 border border-red-500/30'
                                            }`}>
                                            {item.verificationStatus}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CollapsibleCard>
            )}

            <CollapsibleCard title="Prelims Questions" icon={<PrelimsIcon className="w-6 h-6" />}>
                 {data.prelimsQuestions.map((q, i) => (
                    <PrelimsQuestionCard key={i} question={q} index={i} />
                ))}
            </CollapsibleCard>

            <CollapsibleCard title="Mains Questions" icon={<MainsIcon className="w-6 h-6" />}>
                {data.mainsQuestions.map((q, i) => (
                    <MainsQuestionCard key={i} question={q} index={i} />
                ))}
            </CollapsibleCard>

            <CollapsibleCard title="Interview Questions" icon={<InterviewIcon className="w-6 h-6" />}>
                 <div className="space-y-6">
                    {data.interviewQuestions.map((q, i) => (
                         <div key={i} className="bg-dark-900/50 p-5 rounded-lg border border-dark-700">
                            <h3 className="font-semibold text-md mb-3 text-primary/90">{q.type}</h3>
                            <blockquote className="border-l-4 border-primary/50 pl-4 mb-4">
                                <p className="text-gray-200 text-lg italic">"{q.question}"</p>
                            </blockquote>
                            <div className="border-t border-dark-600 pt-4">
                                <p className="text-sm font-semibold text-accent-yellow mb-2">Model Answer Framework:</p>
                                <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{q.answer}</p>
                            </div>
                        </div>
                    ))}
                 </div>
            </CollapsibleCard>

            <CollapsibleCard title="What Examiner Is Testing" icon={<TargetIcon className="w-6 h-6" />}>
                <ul className="space-y-3">
                    {(data.whatExaminerIsTesting || []).map((item, i) => {
                        const parts = item.split(':');
                        const boldPart = parts[0];
                        const rest = parts.slice(1).join(':').trim();
                        return (
                            <li key={i} className="flex items-start gap-3 p-3 bg-dark-900 rounded-md">
                                <TargetIcon className="w-5 h-5 text-accent-yellow mt-1 flex-shrink-0" />
                                <div>
                                    <span className="font-semibold text-gray-100">{boldPart}{rest ? ':' : ''}</span>
                                    {rest ? ` ${rest}`: ''}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </CollapsibleCard>
            
            <CollapsibleCard title="Final Thoughts" icon={<BrainIcon className="w-6 h-6" />}>
                <p className="italic text-lg leading-relaxed text-gray-200 bg-dark-900/50 p-4 rounded-md border-l-4 border-primary shadow-lg">{data.finalThoughts}</p>
            </CollapsibleCard>

            {data.relatedTopics && data.relatedTopics.length > 0 && (
                <div className="mt-8 p-5 bg-dark-800/60 backdrop-blur-xl border border-dark-700 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <LightbulbIcon className="w-6 h-6 text-accent-yellow" />
                        <h3 className="text-xl font-semibold text-gray-100">Explore Related Topics</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {data.relatedTopics.map((relatedTopic, i) => (
                            <button
                                key={i}
                                onClick={() => handleGenerate(relatedTopic)}
                                disabled={isLoading}
                                className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-md text-gray-300 hover:bg-dark-600 hover:text-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-dark-700 disabled:hover:text-gray-300"
                            >
                                {relatedTopic}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <GoDeepSection topic={topic} />
        </div>
    );
};


const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    
    const [topic, setTopic] = useState<string>('');
    const [frameworkData, setFrameworkData] = useState<FrameworkData | null>(null);
    const [sources, setSources] = useState<Source[] | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
    
    const [fakeEmail, setFakeEmail] = useState<{ to: string; code: string; isOpen: boolean }>({ to: '', code: '', isOpen: false });

    const getHistoryKey = (email: string) => `upscFrameworkHistory_${email}`;

    // Check for existing session on initial render
    useEffect(() => {
        const session = authService.getCurrentUser();
        if (session) {
            setCurrentUser(session);
        }
    }, []);

    // Load user-specific history when user logs in
    useEffect(() => {
        if (currentUser) {
            try {
                const storedHistory = localStorage.getItem(getHistoryKey(currentUser.email));
                if (storedHistory) {
                    setHistory(JSON.parse(storedHistory));
                } else {
                    setHistory([]);
                }
            } catch (e) {
                console.error("Failed to parse history from localStorage", e);
                setHistory([]);
            }
        } else {
            // Clear history when user logs out
            setHistory([]);
        }
    }, [currentUser]);

    const handleGenerate = useCallback(async (submittedTopic: string) => {
        if (!currentUser) {
            setError("Please log in to generate a framework.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setFrameworkData(null);
        setSources(undefined);
        setTopic(submittedTopic);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        try {
            const { data, sources } = await generateFramework(submittedTopic);
            setFrameworkData(data);
            setSources(sources);
            
            setHistory(prevHistory => {
                const newHistory = [
                    submittedTopic,
                    ...prevHistory.filter(item => item !== submittedTopic)
                ].slice(0, 50);
                localStorage.setItem(getHistoryKey(currentUser.email), JSON.stringify(newHistory));
                return newHistory;
            });
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "An unexpected error occurred.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);
    
    const handleAuthSuccess = (session: { email: string }) => {
        setCurrentUser(session);
        // Reset app state for new user
        setTopic('');
        setFrameworkData(null);
        setError(null);
    };

    const handleShowVerificationEmail = (email: string, code: string) => {
        setFakeEmail({ to: email, code, isOpen: true });
    };

    const handleLogout = async () => {
        await authService.logOut();
        setCurrentUser(null);
        setTopic('');
        setFrameworkData(null);
        setError(null);
    };
    
    const toggleHistory = () => setIsHistoryOpen(prev => !prev);

    const clearHistory = () => {
        if (currentUser) {
            setHistory([]);
            localStorage.removeItem(getHistoryKey(currentUser.email));
        }
        setIsHistoryOpen(false);
    };

    return (
        <div className="min-h-screen">
            <FakeEmailClient 
                isOpen={fakeEmail.isOpen}
                to={fakeEmail.to}
                code={fakeEmail.code}
                onClose={() => setFakeEmail(prev => ({ ...prev, isOpen: false }))}
            />
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                onAuthSuccess={handleAuthSuccess}
                onShowVerificationEmail={handleShowVerificationEmail}
            />
            <AppHeader 
                user={currentUser}
                onToggleHistory={toggleHistory}
                onLoginClick={() => setIsAuthModalOpen(true)}
                onLogoutClick={handleLogout}
            />
            {currentUser && (
                 <HistorySidebar
                    isOpen={isHistoryOpen}
                    onClose={toggleHistory}
                    history={history}
                    onSelectTopic={handleGenerate}
                    onClearHistory={clearHistory}
                    isLoading={isLoading}
                />
            )}
            <main className="max-w-7xl mx-auto p-4 sm:p-6">
                {currentUser ? (
                    <TopicInput onSubmit={handleGenerate} isLoading={isLoading} />
                ) : (
                    <WelcomeScreen onLoginClick={() => setIsAuthModalOpen(true)} />
                )}

                <div className="mt-8">
                    {isLoading && <Loader />}
                    {error && <div className="p-4 bg-red-900/50 backdrop-blur-xl border border-red-500/50 text-red-300 rounded-xl">{error}</div>}
                    {frameworkData && currentUser && (
                        <FrameworkDisplay 
                            data={frameworkData} 
                            topic={topic} 
                            handleGenerate={handleGenerate} 
                            isLoading={isLoading} 
                            sources={sources} 
                        />
                    )}
                </div>
            </main>
            <footer className="text-center p-6 text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} UPSC Universal Framework Generator. AI-generated content requires verification.</p>
            </footer>
        </div>
    );
};

export default App;