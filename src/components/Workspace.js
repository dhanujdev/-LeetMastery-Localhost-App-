"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import Link from 'next/link';
import Chat from './Chat';
import DescriptionPane from './Workspace/DescriptionPane';
import SolutionsPane from './Workspace/SolutionsPane';
import VisualizerPane from './Workspace/VisualizerPane';
import TestResultsPane from './Workspace/TestResultsPane';

export default function Workspace({ problem }) {
    const [code, setCode] = useState(problem.starterCode);
    const [output, setOutput] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [isAiOpen, setIsAiOpen] = useState(true); // Default open for "Docked" feel

    // Tab Configuration
    const TABS = [
        { id: 'description', label: 'Problem', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, component: <DescriptionPane problem={problem} /> },
        { id: 'solutions', label: 'Solutions', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>, component: <SolutionsPane problem={problem} /> },
        { id: 'visualize', label: 'Visualize', icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>, component: <VisualizerPane /> },
    ];

    const runCode = useCallback(async () => {
        if (isLoading) return;
        setIsLoading(true);
        // Do not clear output immediately to keep previous context valid until new one arrives
        try {
            const res = await fetch('/api/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language: 'python', problemId: problem.id }),
            });
            const data = await res.json();

            // Try parsing stdout as JSON if it comes from our test runner
            try {
                if (data.stdout) {
                    const jsonResult = JSON.parse(data.stdout);
                    setOutput({ ...data, testResult: jsonResult });

                    // Auto-Save if all passed
                    if (jsonResult.summary.includes("Passed") && jsonResult.details.every(d => d.status === "Passed")) {
                        await fetch('/api/save', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ problemId: problem.id, code, status: 'Solved' })
                        });
                    }
                } else {
                    setOutput(data);
                }
            } catch (e) {
                setOutput(data); // Fallback to raw text if not JSON
            }

        } catch (e) {
            setOutput({ error: 'Network Error' });
        } finally {
            setIsLoading(false);
        }
    }, [code, problem.id, isLoading]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Run: Command + Enter or Ctrl + Enter
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                runCode();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [runCode]);

    return (
        <div className="flex flex-col h-screen bg-[var(--bg-app)] text-[var(--text-primary)] overflow-hidden font-sans">
            {/* 1. Top Navigation Bar (Global) */}
            <header className="h-[48px] shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] flex items-center justify-between px-4 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                        {/* Logo or Icon */}
                        <div className="w-6 h-6 bg-[var(--primary)] rounded text-[var(--primary-foreground)] flex items-center justify-center font-bold text-xs">LM</div>
                    </Link>
                    <div className="h-4 w-px bg-[var(--border-default)]"></div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-[var(--text-primary)]">{problem.id}. {problem.title}</span>
                        {/* Difficulty Badge Mockup */}
                        {/* <span className="text-[10px] bg-[var(--bg-secondary)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded border border-[var(--border-default)]">Easy</span> */}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Toggle AI Button for Header access */}
                    <button
                        onClick={() => setIsAiOpen(!isAiOpen)}
                        className={`p-1.5 rounded transition-colors ${isAiOpen ? 'text-[var(--primary)] bg-[var(--primary-bg)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
                        title="Toggle AI Coach"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    </button>
                    {/* User Profile Mock */}
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full"></div>
                </div>
            </header>

            {/* 2. Main Workspace Layout (3 Columns) */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT PANE: Description / Solutions / Visualizer */}
                <div className="w-[35%] min-w-[300px] flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-panel)]">
                    {/* Tab Selection */}
                    <div className="flex items-center bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] px-2 gap-1 pt-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3 py-2 text-[12px] font-medium flex items-center gap-2 rounded-t transition-colors relative top-[1px]
                                    ${activeTab === tab.id
                                        ? 'bg-[var(--bg-panel)] text-[var(--text-primary)] border-t border-l border-r border-[var(--border-subtle)]'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    {/* Pane Content */}
                    <div className="flex-1 overflow-auto bg-[var(--bg-panel)] custom-scrollbar">
                        {TABS.find(t => t.id === activeTab)?.component}
                    </div>
                </div>

                {/* MIDDLE PANE: Editor (Dominant) & Test Results */}
                <div className="flex-1 flex flex-col min-w-[400px] bg-[var(--bg-app)] relative">

                    {/* Editor Top Bar (Contextual Actions) */}
                    <div className="h-[40px] shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-app)] flex items-center justify-between px-3">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors">
                                <span className="text-xs font-mono">Python 3</span>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                            <div className="w-px h-3 bg-[var(--border-default)]"></div>
                            {/* Shortcuts Hints */}
                            <div className="flex gap-2">
                                <span className="text-[10px] text-[var(--text-tertiary)] border border-[var(--border-default)] rounded px-1.5 hidden lg:inline-block">⌘ + Enter to Run</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCode(problem.starterCode)}
                                className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                                title="Reset Code"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                            <button
                                onClick={runCode}
                                disabled={isLoading}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:text-white hover:border-[var(--text-secondary)] transition-all text-xs font-medium uppercase tracking-wide
                                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                {isLoading ? 'Running...' : 'Run'}
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1 rounded-[4px] bg-[var(--success-bg)] text-[var(--success)] hover:bg-[var(--success)] hover:text-white transition-all text-xs font-medium uppercase tracking-wide border border-transparent">
                                Submit
                            </button>
                        </div>
                    </div>

                    {/* Monaco Editor Container */}
                    <div className="flex-1 relative h-full min-h-0 overflow-hidden">
                        <Editor
                            height="100%"
                            defaultLanguage="python"
                            theme="vs-dark"
                            value={code}
                            onChange={(value) => setCode(value)}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                                lineNumbers: 'on',
                                roundedSelection: false,
                                scrollBeyondLastLine: false,
                                readOnly: false,
                                automaticLayout: true,
                                padding: { top: 16 },
                                scrollbar: {
                                    vertical: 'visible',
                                    horizontal: 'visible',
                                    useShadows: false,
                                    verticalScrollbarSize: 10,
                                },
                            }}
                        />
                    </div>

                    {/* Bottom Split: Test Results (Toggleable/Resizable in future) */}
                    {/* If output exists, we show this pane. Ideally this is collapsible. 
                        For now, we give it a fixed height if active, or auto. */}
                    {output && (
                        <div className="h-[250px] shrink-0 border-t border-[var(--border-subtle)]">
                            <TestResultsPane output={output} onClose={() => setOutput(null)} />
                        </div>
                    )}
                </div>

                {/* RIGHT PANE: AI Assistant (Collapsible) */}
                {isAiOpen && (
                    <div className="w-[300px] shrink-0 border-l border-[var(--border-subtle)] bg-[var(--bg-panel)] animate-in slide-in-from-right-10 duration-200">
                        <Chat problem={problem} code={code} />
                    </div>
                )}
            </div>
        </div>
    );
}

