import os
import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import mlx_lm
import mlx_whisper

# Configuration
LLM_MODEL = "mlx-community/Llama-3.2-3B-Instruct-4bit"
WHISPER_MODEL = "mlx-community/whisper-tiny"
PORT = 8080
HOST = "127.0.0.1"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State
model = None
tokenizer = None

def load_models():
    global model, tokenizer
    print(f"Loading LLM: {LLM_MODEL}...")
    model, tokenizer = mlx_lm.load(LLM_MODEL)
    print("LLM Loaded.")
    # Whisper loads on demand or we can warm it up, but on-demand is fine for local

@app.on_event("startup")
async def startup_event():
    load_models()

# --- Data Models ---
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    temperature: Optional[float] = 0.7
    max_tokens: Optional[int] = 1000

# --- Endpoints ---

@app.get("/v1/models")
async def get_models():
    return {"data": [{"id": LLM_MODEL}]}

@app.post("/v1/chat/completions")
async def chat_completions(req: ChatRequest):
    try:
        # Convert Pydantic models to list of dicts for tokenizer
        messages_dicts = [{"role": m.role, "content": m.content} for m in req.messages]
        
        # Apply Chat Template
        if hasattr(tokenizer, "apply_chat_template"):
            prompt = tokenizer.apply_chat_template(
                messages_dicts, 
                tokenize=False, 
                add_generation_prompt=True
            )
        else:
            # Fallback (should not happen for Llama 3.2 Instruct)
            prompt = ""
            for m in messages_dicts:
                prompt += f"{m['role']}: {m['content']}\n"
            prompt += "assistant: "

        # Generate
        response_text = mlx_lm.generate(
            model, 
            tokenizer, 
            prompt=prompt, 
            max_tokens=req.max_tokens, 
            temp=req.temperature,
            verbose=False # Don't print to stdout
        )

        return {
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": response_text
                    }
                }
            ]
        }
    except Exception as e:
        print(f"Error generating chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/v1/audio/transcriptions")
async def transcribe_audio(file: UploadFile = File(...)):
    print(f"Received audio file: {file.filename}")
    temp_filename = f"temp_audio_{file.filename}"
    
    try:
        # Save uploaded file
        with open(temp_filename, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Transcribe using MLX Whisper
        print("Transcribing...")
        # whisper-tiny is very fast on M1/M2/M3
        result = mlx_whisper.transcribe(temp_filename, path_or_hf_repo=WHISPER_MODEL)
        text = result["text"].strip()
        print(f"Transcription: {text}")
        
        return {"text": text}
        
    except Exception as e:
        print(f"Transcription Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=PORT)
