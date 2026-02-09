"""
Pydantic models for chat functionality.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class MessageRole(str, Enum):
    """Chat message role"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatMessage(BaseModel):
    """Single chat message"""
    role: MessageRole
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatSession(BaseModel):
    """Chat session with context"""
    session_id: str
    analysis_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    messages: List[ChatMessage] = Field(default_factory=list)
    context: dict = Field(default_factory=dict)  # Stores protocol and analysis data


class ChatStartRequest(BaseModel):
    """Request to start a new chat session"""
    analysis_id: str


class ChatStartResponse(BaseModel):
    """Response with new session ID"""
    session_id: str
    suggested_questions: List[str] = Field(
        default_factory=lambda: [
            "What's the biggest risk in this protocol?",
            "How can I reduce the failure risk?",
            "Which historical trials are most relevant?",
            "What would it cost to implement your recommendations?",
        ]
    )


class ChatMessageRequest(BaseModel):
    """Request to send a message"""
    message: str


class ChatMessageResponse(BaseModel):
    """Response to a chat message"""
    message: ChatMessage
    streaming: bool = False
