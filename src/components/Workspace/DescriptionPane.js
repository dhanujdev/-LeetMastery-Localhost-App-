"use client";
import React from 'react';

export default function DescriptionPane({ problem }) {
    return (
        <div className="flex flex-col gap-4 p-4 text-[13px] text-[var(--text-primary)] leading-relaxed">
            <h2 className="text-xl font-bold">{problem.id}. {problem.title}</h2>

            <div className="flex items-center gap-2 mb-2">
                <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
                {/* Simulated Tags */}
                <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">Array</span>
                <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-full">Hash Table</span>
            </div>

            <div className="prose prose-invert max-w-none text-[var(--text-primary)]">
                <div className="whitespace-pre-wrap">
                    {problem.description}
                </div>

                <div className="mt-6 flex flex-col gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">Example 1:</h3>
                        <div className="bg-[var(--bg-secondary)] p-3 rounded-lg border-l-2 border-[var(--border-default)] font-mono text-xs text-[var(--text-secondary)] flex flex-col gap-1">
                            <div><strong className="text-[var(--text-primary)]">Input:</strong> nums = [2,7,11,15], target = 9</div>
                            <div><strong className="text-[var(--text-primary)]">Output:</strong> [0,1]</div>
                            <div><strong className="text-[var(--text-primary)]">Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].</div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">Constraints:</h3>
                        <ul className="list-disc pl-5 space-y-1 text-xs text-[var(--text-secondary)] marker:text-[var(--text-tertiary)]">
                            <li><code>2 &lt;= nums.length &lt;= 10^4</code></li>
                            <li><code>-10^9 &lt;= nums[i] &lt;= 10^9</code></li>
                            <li><code>-10^9 &lt;= target &lt;= 10^9</code></li>
                            <li>Only one valid answer exists.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
