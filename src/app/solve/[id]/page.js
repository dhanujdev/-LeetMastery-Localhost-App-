import { getProblems } from '@/lib/data';
import Workspace from '@/components/Workspace';

export async function generateStaticParams() {
    const problems = getProblems();
    return problems.map((problem) => ({
        id: problem.id,
    }));
}

export default async function ProblemPage({ params }) {
    const { id } = await params;
    const problems = getProblems();
    const problem = problems.find((p) => p.id === id);

    if (!problem) {
        return <div>Problem not found</div>;
    }

    return <Workspace problem={problem} />;
}
