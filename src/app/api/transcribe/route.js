import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const formData = await req.formData();

        const res = await fetch('http://127.0.0.1:8080/v1/audio/transcriptions', {
            method: 'POST',
            body: formData,
            // fetch automatically sets Content-Type to multipart/form-data with boundary when body is FormData
        });

        if (!res.ok) {
            const err = await res.text();
            return NextResponse.json({ error: `Backend Error: ${err}` }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Transcription Proxy Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
