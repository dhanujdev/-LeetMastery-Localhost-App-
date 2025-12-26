"use client";

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import Link from 'next/link';
import Chat from './Chat';
import DataStructureVisualizer from './Visualizers/DataStructureVisualizer';

export default function Workspace({ problem }) {
    const [code, setCode] = useState(problem.starterCode);
    const [output, setOutput] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('description');

    const runCode = async () => {
        setIsLoading(true);
        setOutput(null);
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
    };

    return (
        <div className="flex" style={{ height: '100vh', overflow: 'hidden' }}>
            {/* Left Panel: Tabs & Content */}
            <div style={{ width: '40%', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', background: 'var(--card-bg)' }}>
                {/* Header/Nav */}
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                    <Link href="/" style={{ display: 'inline-block', marginBottom: '0.5rem', color: 'var(--primary)', textDecoration: 'none' }}>← Back</Link>
                    <div className="flex items-center gap-2">
                        <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
                        <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{problem.title}</h1>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#333] bg-[#252526]">
                    <button
                        onClick={() => setActiveTab('description')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'description' ? 'border-[#0e639c] text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        Description
                    </button>
                    <button
                        onClick={() => setActiveTab('solutions')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'solutions' ? 'border-[#0e639c] text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        Solutions
                    </button>
                    <button
                        onClick={() => setActiveTab('visualize')}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'visualize' ? 'border-[#0e639c] text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        Visualize
                    </button>
                </div>

                {/* Tab Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

                    {activeTab === 'description' && (
                        <div className="prose prose-invert" style={{ maxWidth: 'none' }}>
                            <div className="whitespace-pre-wrap">{problem.description}</div>

                            <div style={{ marginTop: '2rem' }}>
                                <h3>Examples</h3>
                                <pre className="bg-[#1e1e1e] p-3 rounded text-sm text-gray-300 border border-[#333]">
                                    Input: ...{"\n"}
                                    Output: ...
                                </pre>
                            </div>
                        </div>
                    )}

                    {activeTab === 'solutions' && (
                        <div className="space-y-4">
                            <div className="bg-[#1e1e1e] p-4 rounded border border-[#333]">
                                <h3 className="text-lg font-semibold text-[#4ade80] mb-2">Hints</h3>
                                <p className="text-gray-300 italic">
                                    {problem.mastery?.hint || problem.hints || "No hints available for this problem yet. Try asking the AI!"}
                                </p>
                            </div>

                            <div className="bg-[#1e1e1e] p-4 rounded border border-[#333]">
                                <h3 className="text-lg font-semibold text-[#0e639c] mb-2">Approaches</h3>
                                {problem.solution ? (
                                    <div className="whitespace-pre-wrap text-sm text-gray-300 font-mono bg-[#111] p-3 rounded">
                                        {problem.solution}
                                    </div>
                                ) : (
                                    <p className="text-gray-400">Detailed solution breakdown coming soon.</p>
                                )}
                            </div>

                            {problem.mastery && (
                                <div className="bg-[#1e1e1e] p-4 rounded border border-[#333] mt-4">
                                    <h3 className="text-lg font-semibold text-[#a855f7] mb-2">Mastery Stats</h3>
                                    <div className="flex gap-4 text-sm text-gray-300">
                                        <span>Time: <span className="text-white">{problem.mastery.time}</span></span>
                                        <span>Space: <span className="text-white">{problem.mastery.space}</span></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'visualize' && (
                        <DataStructureVisualizer />
                    )}

                </div>
            </div>

            {/* Right Panel: Editor & Output */}
            <div style={{ width: '60%', display: 'flex', flexDirection: 'column' }}>
                {/* Editor Toolbar */}
                <div className="flex items-center justify-between" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: '#111' }}>
                    <span className="text-sm text-muted">Python 3</span>
                    <div className="flex gap-2">
                        <button className="badge" style={{ background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={() => setCode(problem.starterCode)}>Reset</button>
                        <button
                            onClick={runCode}
                            disabled={isLoading}
                            style={{
                                background: 'var(--accent)',
                                color: '#000',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? 'Running...' : '▶ Run Code'}
                        </button>
                    </div>
                </div>

                {/* Editor Area */}
                <div style={{ flex: 1 }}>
                    <Editor
                        height="100%"
                        defaultLanguage="python"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value)}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                        }}
                    />
                </div>

                {/* Output Terminal */}
                <div style={{ height: '35%', borderTop: '1px solid var(--border)', background: '#0d0d0d', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #222', fontSize: '0.75rem', fontWeight: 600, color: '#888' }}>TERMINAL</div>
                    <div style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', overflowY: 'auto', flex: 1 }}>
                        {!output && <span style={{ color: '#444' }}>Result will appear here...</span>}
                        {output && output.error && <span style={{ color: 'var(--danger)' }}>Error: {output.error}</span>}
                        {output && output.stderr && <pre style={{ color: 'var(--danger)', margin: 0 }}>{output.stderr}</pre>}

                        {/* Test Runner Results UI */}
                        {output && output.testResult && (
                            <div>
                                <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                                    {output.testResult.summary.includes("Passed") && output.testResult.details.every(d => d.status === "Passed")
                                        ? <span style={{ color: 'var(--accent)' }}>✅ {output.testResult.summary}</span>
                                        : <span style={{ color: 'var(--danger)' }}>❌ {output.testResult.summary}</span>
                                    }
                                </div>
                                <div className="flex" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                                    {output.testResult.details.map((res, i) => (
                                        <div key={i} style={{ padding: '0.5rem', background: '#1a1a1a', borderRadius: '4px', borderLeft: `3px solid ${res.status === 'Passed' ? 'var(--accent)' : 'var(--danger)'}` }}>
                                            <div className="flex justify-between">
                                                <span style={{ fontWeight: 600 }}>Case {i + 1}</span>
                                                <span className={`badge ${res.status === 'Passed' ? 'badge-easy' : 'badge-hard'}`} style={{ fontSize: '0.65rem' }}>{res.status}</span>
                                            </div>
                                            <div className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>In: {res.input}</div>
                                            {res.status === 'Failed' && <div className="text-sm" style={{ color: 'var(--danger)' }}>Expected: {res.expected} | Got: {res.got}</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Raw Output Fallback */}
                        {output && !output.testResult && output.stdout && <pre style={{ color: 'var(--foreground)', margin: 0 }}>{output.stdout}</pre>}
                    </div>
                </div>
            </div>
            {/* AI Assistant */}
            <Chat problem={problem} code={code} />
        </div>
    );
}
