'use client';
import { useState, useRef, useEffect } from 'react';

export default function Chat({ problem, code }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const sendMessage = async (text) => {
        if (!text && !input) return;
        const userMessage = text || input;

        // Add User Message
        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        const systemPrompt = `
You are a helpful coding assistant.
Problem: ${problem.title}
Desc: ${problem.description}
Code:
\`\`\`python
${code}
\`\`\`
Be concise and helpful.
`;

        const apiMessages = [
            { role: 'system', content: systemPrompt },
            ...newMessages.map(m => ({ role: m.role, content: m.content }))
        ];

        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages, temperature: 0.7 }),
            });

            const data = await res.json();

            if (data.error) {
                setMessages([...newMessages, { role: 'assistant', content: `Error: ${data.error}` }]);
            } else {
                setMessages([...newMessages, { role: 'assistant', content: data.choices[0].message.content }]);
            }

        } catch (e) {
            setMessages([...newMessages, { role: 'assistant', content: "Network Error. Ensure AI server is running." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-panel)]">
            {/* Header */}
            <div className="h-[43px] shrink-0 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] flex items-center justify-between px-3">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold tracking-tighter shadow-sm">AI</div>
                    <span className="text-xs font-bold text-[var(--text-primary)] tracking-tight">Coding Coach</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-[var(--bg-app)] px-2 py-0.5 rounded-full border border-[var(--border-default)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse shadow-[0_0_4px_var(--success)]"></span>
                        <span className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Online</span>
                    </div>
                    <button
                        onClick={() => setMessages([])}
                        className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                        title="Clear Chat"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages */}
            < div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4 custom-scrollbar" >
                {
                    messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--text-tertiary)] opacity-60">
                            <div className="text-4xl grayscale">✨</div>
                            <p className="text-center text-xs px-4 leading-relaxed">
                                I'm your local AI pair programmer.<br />
                                Ask me to explain the problem, debug your code, or give a hint.
                            </p>
                            <div className="w-full flex flex-col gap-2 px-6">
                                <SuggestionButton onClick={() => sendMessage("Explain this problem to me intuitively")} label="Explain Concept" />
                                <SuggestionButton onClick={() => sendMessage("What data structure fits best here?")} label="Suggest Approach" />
                                <SuggestionButton onClick={() => sendMessage("Review my code for potential bugs")} label="Review Code" />
                            </div>
                        </div>
                    )
                }

                {
                    messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <span className="text-[10px] text-[var(--text-tertiary)] mb-1 px-1">
                                {msg.role === 'user' ? 'You' : 'AI'}
                            </span>
                            <div className={`max-w-[95%] p-3 rounded-lg text-[13px] leading-relaxed border shadow-sm
                            ${msg.role === 'user'
                                    ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-default)]'
                                    : 'bg-transparent text-[var(--text-secondary)] border-transparent pl-0'
                                }`}>
                                {/* Simple Message Renderer */}
                                {msg.content.split('```').map((part, i) => {
                                    if (i % 2 === 1) { // Code Block
                                        return (
                                            <div key={i} className="my-2 rounded-md overflow-hidden border border-[var(--border-default)] bg-[#1e1e1e] shadow-inner">
                                                <div className="p-2 overflow-x-auto">
                                                    <pre className="m-0 font-mono text-[11px] text-[#9cdcfe] leading-5">
                                                        {part.trim()}
                                                    </pre>
                                                </div>
                                            </div>
                                        )
                                    } else { // Text
                                        return (
                                            <span key={i} className="whitespace-pre-wrap">
                                                {part.split('`').map((subPart, j) => (
                                                    j % 2 === 1
                                                        ? <code key={j} className="bg-[var(--bg-hover)] px-1.5 py-0.5 rounded font-mono text-[11px] text-[var(--primary)]">{subPart}</code>
                                                        : subPart
                                                ))}
                                            </span>
                                        )
                                    }
                                })}
                            </div>
                        </div>
                    ))
                }

                {
                    loading && (
                        <div className="flex justify-start pl-1">
                            <div className="flex gap-1 items-center bg-[var(--bg-secondary)] px-3 py-2 rounded-lg text-[10px] text-[var(--text-tertiary)]">
                                <span className="animate-bounce">●</span>
                                <span className="animate-bounce delay-100">●</span>
                                <span className="animate-bounce delay-200">●</span>
                            </div>
                        </div>
                    )
                }
                <div ref={messagesEndRef} />
            </div >

            {/* Input Area */}
            < div className="p-3 bg-[var(--bg-panel)] border-t border-[var(--border-subtle)]" >
                <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    className="flex gap-2 items-center"
                >
                    <AudioRecorder onTranscription={(text) => setInput(text)} />
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-default)] rounded px-3 py-2 text-xs focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:text-[var(--text-tertiary)]"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] disabled:opacity-30 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </form>
            </div >
        </div >
    );
}

function AudioRecorder({ onTranscription }) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('file', blob, 'recording.webm');

                // Send to backend
                try {
                    const res = await fetch('/api/transcribe', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await res.json();
                    if (data.text) {
                        onTranscription(data.text);
                    }
                } catch (error) {
                    console.error("Transcription failed", error);
                }

                // Cleanup
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Mic Error:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <button
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all bg-[var(--bg-secondary)] border border-[var(--border-default)]
                ${isRecording ? 'text-[var(--danger)] border-[var(--danger)] bg-[var(--danger-bg)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]'}`}
            title="Hold to Record"
        >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
        </button>
    );
}

function SuggestionButton({ onClick, label }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] px-3 py-2 rounded border border-[var(--border-default)] text-[11px] flex justify-between transition-colors items-center group"
        >
            {label}
            <span className="opacity-0 group-hover:opacity-50 transition-opacity">→</span>
        </button>
    )
}

