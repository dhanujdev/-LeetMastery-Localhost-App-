"use client";
import React from 'react';

export default function SolutionsPane({ problem }) {
    return (
        <div className="flex flex-col gap-4 p-4 text-[13px]">
            {/* Disclaimer */}
            <div className="bg-[var(--warning-bg)] p-3 rounded border border-[var(--warning)]/20 text-[var(--warning)]">
                <p className="font-medium">Community Solutions</p>
            </div>

            {/* Approaches Section */}
            <div className="space-y-4">
                <div className="group cursor-pointer">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors mb-2">
                        Approach 1: One-Pass Hash Table
                    </h3>
                    <div className="flex gap-2 mb-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)]">Python3</span>
                        <span className="px-2 py-0.5 rounded bg-[var(--success-bg)] text-[var(--success)]">O(n)</span>
                    </div>
                    <div className="bg-[var(--bg-secondary)] p-3 rounded font-mono text-xs text-[var(--text-code)] overflow-x-auto border border-[var(--border-default)]">
                        <pre>{`class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        hashmap = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in hashmap:
                return [hashmap[diff], i]
            hashmap[num] = i`}</pre>
                    </div>
                </div>

                <div className="group cursor-pointer">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors mb-2">
                        Approach 2: Brute Force
                    </h3>
                    <div className="flex gap-2 mb-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)]">Python3</span>
                        <span className="px-2 py-0.5 rounded bg-[var(--danger-bg)] text-[var(--danger)]">O(n²)</span>
                    </div>
                    <p className="text-[var(--text-secondary)] mb-2">
                        Iterate through each element and find if there is another value that equals to <code>target - x</code>.
                    </p>
                </div>
            </div>

            {/* Hints Section */}
            <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">Hints</h3>
                <div className="bg-[var(--bg-secondary)] p-3 rounded text-[var(--text-secondary)] italic border-l-2 border-[var(--text-tertiary)]">
                    {problem.mastery?.hint || problem.hints || "Try using a Hash Map to store visited elements."}
                </div>
            </div>
        </div>
    );
}
