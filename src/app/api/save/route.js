import { NextResponse } from 'next/server';
import { updateProblemStatus, getProblems } from '@/lib/data';
import path from 'path';
import fs from 'fs';

export async function POST(req) {
    try {
        const { problemId, code, status } = await req.json();

        // 1. Update status
        updateProblemStatus(problemId, status);

        // 2. We should also persist the code. 
        // In a real app we'd have a 'user_solutions.json' or DB.
        // For this local MVP, let's just update the 'starterCode' in problems.json directly
        // effectively saving the user's work in place.
        const problems = getProblems();
        const index = problems.findIndex(p => p.id === problemId);
        if (index > -1) {
            problems[index].starterCode = code; // Save code logic
            const dataDirectory = path.join(process.cwd(), 'data');
            const fullPath = path.join(dataDirectory, 'problems.json');
            fs.writeFileSync(fullPath, JSON.stringify(problems, null, 2));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
