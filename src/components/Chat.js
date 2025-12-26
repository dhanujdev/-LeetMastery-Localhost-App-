'use client';
import { useState, useRef, useEffect } from 'react';

export default function Chat({ problem, code }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, isOpen]);

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

    // Styles
    const drawerStyle = {
        position: 'fixed',
        top: 0,
        right: 0,
        width: '400px',
        height: '100vh',
        backgroundColor: '#1e1e1e',
        borderLeft: '1px solid #333',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.5)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
    };

    const headerStyle = {
        padding: '16px',
        backgroundColor: '#252526',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#e5e7eb',
        fontWeight: '600'
    };

    const messagesAreaStyle = {
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        color: '#d4d4d4'
    };

    const inputAreaStyle = {
        padding: '16px',
        backgroundColor: '#252526',
        borderTop: '1px solid #333',
        display: 'flex',
        gap: '8px'
    };

    const textInputStyle = {
        flex: 1,
        backgroundColor: '#3c3c3c',
        color: 'white',
        border: '1px solid #3c3c3c',
        borderRadius: '4px',
        padding: '8px 12px',
        outline: 'none',
        fontSize: '14px'
    };

    const buttonStyle = {
        backgroundColor: '#0e639c',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    };

    const fabStyle = {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#0e639c',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        border: 'none',
        cursor: 'pointer',
        zIndex: 90,
        transition: 'transform 0.2s',
        transform: 'scale(1)',
    };

    return (
        <>
            {/* Floating Toggle Button (Only visible when closed) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={fabStyle}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    ✨
                </button>
            )}

            {/* Drawer */}
            <div style={drawerStyle}>

                {/* Header */}
                <div style={headerStyle}>
                    <span>AI Assistant</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '18px' }}
                    >
                        ✕
                    </button>
                </div>

                {/* Messages */}
                <div style={messagesAreaStyle}>
                    {messages.length === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: '#858585' }}>
                            <div style={{ fontSize: '32px' }}>🤖</div>
                            <p style={{ textAlign: 'center' }}>How can I help you with<br /><strong style={{ color: '#d4d4d4' }}>{problem.title}</strong>?</p>
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <SuggestionButton onClick={() => sendMessage("Explain this problem")} label="Explain Problem" />
                                <SuggestionButton onClick={() => sendMessage("Give me a hint")} label="Give Hint" />
                            </div>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                                maxWidth: '90%',
                                padding: '12px 14px',
                                borderRadius: '12px',
                                borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                                borderBottomLeftRadius: msg.role === 'user' ? '12px' : '2px',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                backgroundColor: msg.role === 'user' ? '#0e639c' : '#252526',
                                color: msg.role === 'user' ? 'white' : '#e0e0e0',
                                border: msg.role === 'user' ? 'none' : '1px solid #333',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }}>
                                {/* Custom Markdown Renderer for "Real AI" feel */}
                                {msg.content.split('```').map((part, i) => {
                                    if (i % 2 === 1) { // Code Block
                                        return (
                                            <div key={i} style={{ margin: '8px 0', borderRadius: '6px', overflow: 'hidden', border: '1px solid #444' }}>
                                                <div style={{ backgroundColor: '#1e1e1e', padding: '12px', overflowX: 'auto' }}>
                                                    <pre style={{ margin: 0, fontFamily: 'Consolas, monospace', fontSize: '13px', color: '#9cdcfe' }}>
                                                        {part.trim()}
                                                    </pre>
                                                </div>
                                            </div>
                                        )
                                    } else { // Text
                                        return (
                                            <span key={i} style={{ whiteSpace: 'pre-wrap' }}>
                                                {part.split('`').map((subPart, j) => (
                                                    j % 2 === 1
                                                        ? <code key={j} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }}>{subPart}</code>
                                                        : subPart
                                                ))}
                                            </span>
                                        )
                                    }
                                })}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <div style={{ backgroundColor: '#2d2d2d', color: '#aaa', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', border: '1px solid #333' }}>
                                Taking a look...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div style={inputAreaStyle}>
                    <form
                        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                        style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}
                    >
                        {/* Audio Recorder */}
                        <AudioRecorder onTranscription={(text) => setInput(text)} />

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            style={textInputStyle}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            style={{ ...buttonStyle, opacity: (loading || !input.trim()) ? 0.5 : 1 }}
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </>
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
            style={{
                backgroundColor: isRecording ? '#ef4444' : '#252526',
                color: isRecording ? 'white' : '#9ca3af',
                border: '1px solid #333',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
            title="Hold to Record"
        >
            {isRecording ? '⏺' : '🎤'}
        </button>
    );
}

function SuggestionButton({ onClick, label }) {
    return (
        <button
            onClick={onClick}
            style={{
                width: '100%',
                textAlign: 'left',
                backgroundColor: '#2d2d2d',
                color: '#d4d4d4',
                padding: '10px 16px',
                borderRadius: '4px',
                border: '1px solid #333',
                cursor: 'pointer',
                fontSize: '13px',
                display: 'flex',
                justifyContent: 'space-between'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2d2d2d'}
        >
            {label}
            <span>→</span>
        </button>
    )
}
