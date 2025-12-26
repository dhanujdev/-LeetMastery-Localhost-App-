import { getProblems } from '@/lib/data';
import Link from 'next/link';

export default function Home() {
    const problems = getProblems();

    // Group by Category
    const grouped = problems.reduce((acc, problem) => {
        if (!acc[problem.category]) acc[problem.category] = [];
        acc[problem.category].push(problem);
        return acc;
    }, {});

    return (
        <main className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans">
            {/* Header */}
            <div className="max-w-5xl mx-auto px-6 py-12">
                <header className="flex justify-between items-end mb-12 border-b border-[var(--border-subtle)] pb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-[var(--text-secondary)] bg-clip-text text-transparent">
                            LeetMastery
                        </h1>
                        <p className="text-[var(--text-secondary)] text-lg">
                            Your local hygiene for algorithmic excellence.
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                            <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold mb-1">Total Progress</div>
                            <div className="text-2xl font-mono font-bold text-[var(--primary)]">
                                {problems.filter(p => p.status === 'Solved').length} / {problems.length}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Problem Grid */}
                <div className="space-y-12">
                    {Object.entries(grouped).map(([category, items]) => (
                        <section key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <span className="w-2 h-8 rounded-full bg-[var(--primary)]"></span>
                                {category}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {items.map((problem) => (
                                    <Link href={`/solve/${problem.id}`} key={problem.id} className="group text-left">
                                        <div className="h-full bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg p-5 transition-all duration-200 group-hover:border-[var(--primary)] group-hover:transform group-hover:-translate-y-1 group-hover:shadow-lg relative overflow-hidden">

                                            {/* Status Indicator */}
                                            <div className={`absolute top-0 right-0 w-16 h-16 transform translate-x-8 -translate-y-8 rotate-45 flex items-end justify-center pb-1 ${problem.status === 'Solved' ? 'bg-[var(--success)] shadow-[0_0_10px_var(--success)]' : 'bg-[var(--bg-secondary)]'}`}>
                                                {problem.status === 'Solved' && <svg className="w-4 h-4 text-[#1a1a1a] transform -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                                            </div>

                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`badge badge-${problem.difficulty.toLowerCase()} border border-transparent`}>
                                                    {problem.difficulty}
                                                </span>
                                                <span className="text-xs font-mono text-[var(--text-tertiary)] bg-[var(--bg-app)] px-2 py-1 rounded">
                                                    #{problem.id.toString().padStart(3, '0')}
                                                </span>
                                            </div>

                                            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4 group-hover:text-[var(--primary)] transition-colors pr-6">
                                                {problem.title}
                                            </h3>

                                            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[var(--border-subtle)]">
                                                <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                                                    {problem.status === 'Solved' ? 'Completed' : 'Not Started'}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
}
