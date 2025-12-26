'use client';
import { useState, useEffect } from 'react';

export default function DataStructureVisualizer() {
    const [input, setInput] = useState('[1, 2, 3, 4, 5]');
    const [data, setData] = useState([1, 2, 3, 4, 5]);
    const [type, setType] = useState('array'); // array, linked-list, tree, stack, graph
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
            // Don't show error while typing, only if it persists
        }
    }, [input]);

    return (
        <div className="flex flex-col h-full bg-[var(--bg-panel)] text-white p-4">
            <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Data Structure Visualizer</h2>

            {/* Controls */}
            <div className="flex flex-col gap-4 mb-6 border-b border-[var(--border-default)] pb-6">
                <div>
                    <label className="text-xs text-[var(--text-tertiary)] mb-1 block">Input Data (JSON Array)</label>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[var(--primary)]"
                    />
                    {error && <p className="text-[var(--danger)] text-xs mt-1">{error}</p>}
                </div>

                {/* Controls - Updated */}
                <div className="flex gap-2 flex-wrap">
                    {['array', 'linked-list', 'tree', 'stack', 'graph'].map(t => (
                        <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`px-3 py-1 text-xs rounded border transition-colors capitalize ${type === t ? 'bg-[var(--primary)] border-[var(--primary)] text-white' : 'bg-[var(--bg-secondary)] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-white'}`}
                        >
                            {t.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto bg-[var(--bg-app)] flex items-center justify-center border border-[var(--border-default)] rounded-lg relative min-h-[300px]">
                {type === 'array' && <ArrayVisualizer data={data} />}
                {type === 'linked-list' && <LinkedListVisualizer data={data} />}
                {type === 'tree' && <TreeVisualizer data={data} />}
                {type === 'stack' && <StackVisualizer data={data} />}
                {type === 'graph' && <GraphVisualizer data={data} />}
            </div>
        </div>
    );
}

function ArrayVisualizer({ data }) {
    return (
        <div className="flex gap-1 flex-wrap justify-center p-4">
            {data.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center animate-in zoom-in duration-300">
                    <div className="w-12 h-12 flex items-center justify-center border-2 border-[var(--primary)] bg-[var(--bg-secondary)] text-lg font-bold rounded shadow-sm">
                        {val}
                    </div>
                    <span className="text-xs text-[var(--text-tertiary)] mt-1 font-mono">{idx}</span>
                </div>
            ))}
        </div>
    );
}

function LinkedListVisualizer({ data }) {
    return (
        <div className="flex items-center gap-2 p-4 overflow-x-auto">
            {data.map((val, idx) => (
                <div key={idx} className="flex items-center animate-in slide-in-from-right duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-12 flex items-center justify-center border-2 border-[var(--success)] bg-[var(--bg-secondary)] text-lg font-bold rounded-lg relative shadow-sm">
                            {val}
                            {/* Pointer dot */}
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-[var(--success)] rounded-full"></div>
                        </div>
                        <span className="text-xs text-[var(--text-tertiary)] mt-1 font-mono">Node {idx}</span>
                    </div>

                    {idx < data.length - 1 && (
                        <div className="w-12 h-[2px] bg-[var(--success)] relative">
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-[var(--success)] border-b-[4px] border-b-transparent"></div>
                        </div>
                    )}
                    {idx === data.length - 1 && (
                        <div className="flex items-center text-[var(--text-tertiary)] text-xs ml-2">
                            <div className="w-8 h-[2px] bg-[var(--border-default)]"></div>
                            <span className="ml-1 font-mono">NULL</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function TreeVisualizer({ data }) {
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
    const levelHeight = 60;

    nodes.forEach(node => {
        if (node.level === 0) {
            node.realX = 300;
            node.realY = 40;
        } else {
            const offset = 150 / Math.pow(1.5, node.level);
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
                        x1={node.parent.realX + 20}
                        y1={node.parent.realY + 20}
                        x2={node.realX + 20}
                        y2={node.realY + 20}
                        stroke="var(--border-active)"
                        strokeWidth="2"
                        opacity="0.5"
                    />
                ))}
            </svg>
            {nodes.map(node => (
                <div
                    key={node.id}
                    className="absolute flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-panel)] text-[var(--text-primary)] font-bold text-sm shadow-lg border-2 border-[var(--primary)] z-10 animate-in zoom-in duration-300"
                    style={{ left: node.realX, top: node.realY }}
                >
                    {node.val}
                </div>
            ))}
        </div>
    );
}

function StackVisualizer({ data }) {
    const stack = [...data].reverse();
    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="flex flex-col-reverse justify-start w-32 border-x-4 border-b-4 border-[var(--border-default)] rounded-b-xl bg-[var(--bg-secondary)]/20 p-4 gap-2 min-h-[300px] relative">
                {stack.map((val, idx) => (
                    <div key={idx} className="w-full h-12 bg-[var(--warning)] text-[#1a1a1a] font-bold text-lg flex items-center justify-center rounded shadow-sm animate-in slide-in-from-top-10 fade-in duration-500">
                        {val}
                    </div>
                ))}
            </div>
            <div className="mt-4 text-xs text-[var(--text-tertiary)] uppercase tracking-widest font-semibold">Stack Visualizer</div>
        </div>
    );
}

function GraphVisualizer({ data }) {
    const isEdgeList = Array.isArray(data) && Array.isArray(data[0]);
    if (!isEdgeList) {
        return (
            <div className="flex flex-col items-center justify-center text-[var(--text-tertiary)] h-full">
                <div className="mb-4 text-4xl opacity-20">🕸️</div>
                <div className="text-sm font-medium">Graph Visualizer Expects Edge List</div>
                <code className="mt-2 bg-[var(--bg-secondary)] px-3 py-1 rounded text-xs text-[var(--text-code)] border border-[var(--border-default)]">[[0,1], [1,2], [2,3], [3,0]]</code>
            </div>
        )
    }

    const uniqueNodes = new Set();
    data.forEach(([u, v]) => { uniqueNodes.add(u); uniqueNodes.add(v); });
    const nodes = Array.from(uniqueNodes).sort((a, b) => a - b);

    // Auto-scale radius based on node count
    const radius = Math.max(120, nodes.length * 20);
    const centerX = 300;
    const centerY = 200;

    const nodeCoords = {};
    nodes.forEach((val, i) => {
        const angle = (i / nodes.length) * 2 * Math.PI - (Math.PI / 2);
        nodeCoords[val] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    });

    return (
        <div className="relative w-[600px] h-[400px] animate-in fade-in duration-500">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-tertiary)" opacity="0.6" />
                    </marker>
                </defs>
                {data.map(([u, v], i) => {
                    const src = nodeCoords[u];
                    const dst = nodeCoords[v];
                    if (!src || !dst) return null;
                    return (
                        <line
                            key={i}
                            x1={src.x + 20} y1={src.y + 20}
                            x2={dst.x + 20} y2={dst.y + 20}
                            stroke="var(--text-tertiary)"
                            strokeWidth="2"
                            opacity="0.4"
                            markerEnd="url(#arrowhead)"
                        />
                    );
                })}
            </svg>

            {nodes.map(val => (
                <div
                    key={val}
                    className="absolute w-10 h-10 bg-[var(--bg-panel)] border-2 border-[var(--primary)] rounded-full flex items-center justify-center font-bold text-sm text-[var(--text-primary)] z-10 shadow-[0_0_15px_rgba(255,161,22,0.2)] transition-transform hover:scale-110 cursor-default"
                    style={{ left: nodeCoords[val].x, top: nodeCoords[val].y }}
                >
                    {val}
                </div>
            ))}
        </div>
    )
}
