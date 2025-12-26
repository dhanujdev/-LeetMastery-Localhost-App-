'use client';
import React from 'react';

export default function TestResultsPane({ output, onClose }) {
    if (!output) return null;

    return (
        <div className="flex flex-col h-full bg-[var(--bg-panel)] border-t border-[var(--border-subtle)]">
            {/* Header */}
            <div className="h-9 shrink-0 flex items-center justify-between px-4 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
                <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">Test Results</span>
                <button
                    onClick={onClose}
                    className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                {output.error && (
                    <div className="bg-[var(--danger-bg)] text-[var(--danger)] p-3 rounded border border-[var(--danger)]/20 text-xs font-mono mb-4">
                        {output.error}
                    </div>
                )}

                {output.stderr && (
                    <div className="mb-4">
                        <h4 className="text-[var(--danger)] text-xs font-bold mb-1">Standard Error</h4>
                        <pre className="text-[var(--text-tertiary)] font-mono text-xs bg-[var(--bg-app)] p-2 rounded overflow-x-auto whitespace-pre-wrap">{output.stderr}</pre>
                    </div>
                )}

                {output.stdout && !output.testResult && (
                    <div className="mb-4">
                        <h4 className="text-[var(--text-secondary)] text-xs font-bold mb-1">Standard Output</h4>
                        <pre className="text-[var(--text-primary)] font-mono text-xs bg-[var(--bg-app)] p-2 rounded overflow-x-auto whitespace-pre-wrap">{output.stdout}</pre>
                    </div>
                )}

                {/* Structured Test Results */}
                {output.testResult && (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                        <div className={`mb-4 flex items-center gap-2 text-sm font-bold ${output.testResult.summary.includes("Passed") ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                            {output.testResult.summary.includes("Passed") ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            )}
                            {output.testResult.summary}
                        </div>

                        <div className="space-y-3">
                            {output.testResult.details.map((res, i) => (
                                <div key={i} className="flex flex-col gap-2 p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-[var(--text-secondary)]">Case {i + 1}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${res.status === 'Passed' ? 'bg-[var(--success-bg)] text-[var(--success)]' : 'bg-[var(--danger-bg)] text-[var(--danger)]'}`}>
                                            {res.status}
                                        </span>
                                    </div>

                                    {/* Only show details if failed or strictly requested (but for density, hide mostly if passed) */}
                                    <div className="grid grid-cols-[60px_1fr] gap-x-2 gap-y-1 text-xs font-mono">
                                        <span className="text-[var(--text-tertiary)] text-right">Input:</span>
                                        <span className="text-[var(--text-code)] break-all">{res.input}</span>

                                        <span className="text-[var(--text-tertiary)] text-right">Output:</span>
                                        <span className={`break-all ${res.status === 'Passed' ? 'text-[var(--text-primary)]' : 'text-[var(--danger)]'}`}>{res.got}</span>

                                        <span className="text-[var(--text-tertiary)] text-right">Expected:</span>
                                        <span className="text-[var(--success)] break-all">{res.expected}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
