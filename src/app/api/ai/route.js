import { NextResponse } from 'next/server';

const AI_SERVER_URL = 'http://127.0.0.1:8080/v1/chat/completions';

export async function POST(req) {
    try {
        const body = await req.json();

        // Forward the request to the local Python MLX server
        const response = await fetch(AI_SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            // Check if connection refused (server not running)
            if (response.status === 404 || response.status === 500) {
                // Try to read error text
                const text = await response.text();
                return NextResponse.json({ error: `AI Server Error: ${text}` }, { status: response.status });
            }
            return NextResponse.json({ error: 'Failed to communicate with AI Server' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        if (error.cause && error.cause.code === 'ECONNREFUSED') {
            return NextResponse.json(
                {
                    error: 'AI Server is offline.',
                    details: 'Run `python3 src/py/ai_server.py` to start the local AI engine.'
                },
                { status: 503 }
            );
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
