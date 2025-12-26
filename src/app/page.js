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
        <main className="container">
            <header className="flex justify-between items-center" style={{ marginBottom: '3rem', marginTop: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        LeetMastery
                    </h1>
                    <p className="text-muted">Your local hygiene for algorithmic excellence.</p>
                </div>
                <div className="card" style={{ padding: '0.5rem 1rem' }}>
                    <span className="text-sm text-muted">Progress: </span>
                    <span style={{ fontWeight: 600, color: 'var(--accent)' }}>0 / 46 Mastery</span>
                </div>
            </header>

            {Object.entries(grouped).map(([category, items]) => (
                <section key={category} style={{ marginBottom: '3rem' }}>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>{category}</h2>
                    <div className="grid-cols-3">
                        {items.map((problem) => (
                            <Link href={`/solve/${problem.id}`} key={problem.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer' }}>
                                    <div className="flex justify-between items-start">
                                        <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</span>
                                        <span className="text-sm text-muted">#{problem.id}</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{problem.title}</h3>
                                    <div className="flex items-center gap-2" style={{ marginTop: 'auto' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: problem.status === 'Solved' ? 'var(--accent)' : '#333' }} />
                                        <span className="text-sm text-muted">{problem.status}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            ))}
        </main>
    );
}
