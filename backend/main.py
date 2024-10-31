from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from backend.routers import img_text  
app = FastAPI()

# Include img_text router with a prefix for organization
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from localhost:3000
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)
app.include_router(img_text.router, prefix="/img_text", tags=["img_text"])

