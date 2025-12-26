'use client';
import { useState, useEffect } from 'react';

export default function DataStructureVisualizer() {
    const [input, setInput] = useState('[1, 2, 3, 4, 5]');
    const [data, setData] = useState([1, 2, 3, 4, 5]);
    const [type, setType] = useState('array'); // array, linked-list, tree
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            const parsed = JSON.parse(input);
            if (Array.isArray(parsed)) {
                setData(parsed);
                setError(null);
            } else {
                setError("Input must be an array (e.g., [1,2,3])");
            }
        } catch (e) {
            // Don't show error while typing, only if it persists or on specific validation
            // But for now let's just ignore parse errors until valid
        }
    }, [input]);

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] text-white p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-200">Data Structure Visualizer</h2>

            {/* Controls */}
            <div className="flex flex-col gap-4 mb-6 border-b border-[#333] pb-6">
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Input Data (JSON Array)</label>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full bg-[#252526] border border-[#333] rounded px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#0e639c]"
                    />
                    {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setType('array')}
                        className={`px-3 py-1 text-xs rounded border ${type === 'array' ? 'bg-[#0e639c] border-[#0e639c] text-white' : 'bg-[#2d2d2d] border-[#333] text-gray-300'}`}
                    >
                        Array
                    </button>
                    <button
                        onClick={() => setType('linked-list')}
                        className={`px-3 py-1 text-xs rounded border ${type === 'linked-list' ? 'bg-[#0e639c] border-[#0e639c] text-white' : 'bg-[#2d2d2d] border-[#333] text-gray-300'}`}
                    >
                        Linked List
                    </button>
                    <button
                        onClick={() => setType('tree')}
                        className={`px-3 py-1 text-xs rounded border ${type === 'tree' ? 'bg-[#0e639c] border-[#0e639c] text-white' : 'bg-[#2d2d2d] border-[#333] text-gray-300'}`}
                    >
                        Binary Tree
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto bg-[#1e1e1e] flex items-center justify-center border border-[#333] rounded-lg relative min-h-[300px]">
                {type === 'array' && <ArrayVisualizer data={data} />}
                {type === 'linked-list' && <LinkedListVisualizer data={data} />}
                {type === 'tree' && <TreeVisualizer data={data} />}
            </div>
        </div>
    );
}

function ArrayVisualizer({ data }) {
    return (
        <div className="flex gap-1 flex-wrap justify-center p-4">
            {data.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center">
                    <div className="w-12 h-12 flex items-center justify-center border-2 border-[#0e639c] bg-[#252526] text-lg font-bold rounded">
                        {val}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{idx}</span>
                </div>
            ))}
        </div>
    );
}

function LinkedListVisualizer({ data }) {
    return (
        <div className="flex items-center gap-2 p-4 overflow-x-auto">
            {data.map((val, idx) => (
                <div key={idx} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-12 flex items-center justify-center border-2 border-[#4ade80] bg-[#252526] text-lg font-bold rounded-lg relative">
                            {val}
                            {/* Pointer dot */}
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[#4ade80] rounded-full"></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">Node {idx}</span>
                    </div>

                    {idx < data.length - 1 && (
                        <div className="w-12 h-[2px] bg-[#4ade80] relative">
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-[#4ade80] border-b-[4px] border-b-transparent"></div>
                        </div>
                    )}
                    {idx === data.length - 1 && (
                        <div className="flex items-center text-gray-500 text-xs ml-2">
                            <div className="w-8 h-[2px] bg-gray-600"></div>
                            <span className="ml-1">NULL</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function TreeVisualizer({ data }) {
    // Basic BFS to convert array to tree nodes with coordinates
    // Simplified layout logic for visualization
    if (!data || data.length === 0) return null;

    const buildTree = (arr) => {
        if (!arr.length) return null;
        const root = { val: arr[0], x: 0, y: 0, level: 0, id: 0 };
        const queue = [root];
        const nodes = [root];
        let i = 1;

        while (queue.length > 0 && i < arr.length) {
            const current = queue.shift();

            // Left child
            if (i < arr.length && arr[i] !== null) {
                const left = {
                    val: arr[i],
                    level: current.level + 1,
                    id: i,
                    parent: current,
                    isLeft: true
                };
                queue.push(left);
                nodes.push(left);
            }
            i++;

            // Right child
            if (i < arr.length && arr[i] !== null) {
                const right = {
                    val: arr[i],
                    level: current.level + 1,
                    id: i,
                    parent: current,
                    isLeft: false
                };
                queue.push(right);
                nodes.push(right);
            }
            i++;
        }
        return nodes;
    };

    const nodes = buildTree(data);

    // Calculate simple positions
    // This is a naive renderer, ideally use D3 or Recharts for complex trees, 
    // but for simple LeetCode trees this suffices.
    // Level spacing: 60px
    // Node spacing: depends on level
    const levelHeight = 60;

    // Width logic: Root is at 400. Children spread out.
    // We can assign x coordinates recursively properly, but for now let's try a simple spread.
    // Actually, distinct X logic:
    // Root x=0. Left child x = parent.x - offset. Right child x = parent.x + offset.
    // Offset decreases with level.

    nodes.forEach(node => {
        if (node.level === 0) {
            node.realX = 300; // Center canvas roughly
            node.realY = 40;
        } else {
            const offset = 150 / Math.pow(1.5, node.level); // Decrease spread
            node.realX = node.isLeft ? node.parent.realX - offset : node.parent.realX + offset;
            node.realY = 40 + node.level * levelHeight;
        }
    });

    return (
        <div className="relative w-full h-full min-h-[400px] min-w-[600px]">
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {nodes.map(node => node.parent && (
                    <line
                        key={`line-${node.id}`}
                        x1={node.parent.realX + 20} // Center of parent (20 is half width)
                        y1={node.parent.realY + 20} // Center of parent (20 is half height)
                        x2={node.realX + 20}
                        y2={node.realY + 20}
                        stroke="#555"
                        strokeWidth="2"
                    />
                ))}
            </svg>
            {nodes.map(node => (
                <div
                    key={node.id}
                    className="absolute flex items-center justify-center w-10 h-10 rounded-full bg-[#0e639c] text-white font-bold text-sm shadow-lg border-2 border-[#1e1e1e]"
                    style={{ left: node.realX, top: node.realY }}
                >
                    {node.val}
                </div>
            ))}
        </div>
    );
}
