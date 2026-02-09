"""
Interactive chat endpoints for discussing analysis results.
"""

from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse
import logging
import uuid
from typing import Dict
import json

from app.models.chat import (
    ChatSession,
    ChatMessage,
    ChatStartRequest,
    ChatStartResponse,
    ChatMessageRequest,
    MessageRole
)
from app.services.gemini_service import get_gemini_service
from app.api.analysis import analyses_db

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory chat sessions (use Redis in production)
chat_sessions: Dict[str, ChatSession] = {}


@router.post("/start", response_model=ChatStartResponse)
async def start_chat_session(request: ChatStartRequest):
    """
    Start a new chat session for discussing analysis results

    Args:
        request: Chat start request with analysis ID

    Returns:
        New session ID and suggested questions
    """
    # Verify analysis exists
    if request.analysis_id not in analyses_db:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis {request.analysis_id} not found"
        )

    # Get analysis for context
    analysis = analyses_db[request.analysis_id]

    # Create session
    session_id = str(uuid.uuid4())

    # Build context
    context = {
        "analysis_id": request.analysis_id,
        "risk_score": analysis.risk_score.overall_score,
        "risk_level": analysis.risk_score.risk_level,
        "findings": [f.dict() for f in analysis.findings],
        "recommendations": [r.dict() for r in analysis.recommendations],
        "similar_trials": [t.dict() for t in analysis.similar_trials],
        "executive_summary": analysis.executive_summary
    }

    session = ChatSession(
        session_id=session_id,
        analysis_id=request.analysis_id,
        context=context
    )

    chat_sessions[session_id] = session

    logger.info(f"Started chat session {session_id} for analysis {request.analysis_id}")

    # Generate suggested questions based on analysis
    suggested_questions = [
        "What's the biggest risk in this protocol?",
        "How can I reduce the failure risk?",
        f"Why did {analysis.similar_trials[0].trial_name if analysis.similar_trials else 'similar trials'} fail?",
        "What would it cost to implement your recommendations?",
    ]

    return ChatStartResponse(
        session_id=session_id,
        suggested_questions=suggested_questions
    )


async def chat_stream_generator(session_id: str, user_message: str):
    """
    Generate streaming chat response

    Yields chunks of the response as they arrive from Gemini
    """
    if session_id not in chat_sessions:
        yield {
            "event": "error",
            "data": json.dumps({"error": "Session not found"})
        }
        return

    session = chat_sessions[session_id]

    # Add user message to history
    user_msg = ChatMessage(
        role=MessageRole.USER,
        content=user_message
    )
    session.messages.append(user_msg)

    try:
        # Stream response from Gemini
        gemini_service = get_gemini_service()

        assistant_response = ""
        async for chunk in gemini_service.chat_session(
            session_id=session_id,
            message=user_message,
            context=session.context,
            chat_history=[msg.dict() for msg in session.messages]
        ):
            assistant_response += chunk
            yield {
                "event": "message",
                "data": json.dumps({"chunk": chunk})
            }

        # Add complete response to history
        assistant_msg = ChatMessage(
            role=MessageRole.ASSISTANT,
            content=assistant_response
        )
        session.messages.append(assistant_msg)

        # Send completion event
        yield {
            "event": "complete",
            "data": json.dumps({
                "message": assistant_msg.dict(),
                "total_messages": len(session.messages)
            })
        }

    except Exception as e:
        logger.error(f"Error in chat session {session_id}: {e}")
        yield {
            "event": "error",
            "data": json.dumps({"error": str(e)})
        }


@router.post("/{session_id}/message")
async def send_chat_message(session_id: str, request: ChatMessageRequest):
    """
    Send a message in an existing chat session

    Args:
        session_id: Chat session identifier
        request: Message request with user message

    Returns:
        Server-Sent Events stream with response chunks
    """
    if session_id not in chat_sessions:
        raise HTTPException(
            status_code=404,
            detail=f"Chat session {session_id} not found"
        )

    logger.info(f"Chat message in session {session_id}: {request.message[:50]}...")

    return EventSourceResponse(
        chat_stream_generator(session_id, request.message)
    )


@router.get("/{session_id}/history")
async def get_chat_history(session_id: str):
    """
    Get conversation history for a chat session

    Args:
        session_id: Chat session identifier

    Returns:
        List of messages in the conversation
    """
    if session_id not in chat_sessions:
        raise HTTPException(
            status_code=404,
            detail=f"Chat session {session_id} not found"
        )

    session = chat_sessions[session_id]

    return {
        "session_id": session_id,
        "analysis_id": session.analysis_id,
        "message_count": len(session.messages),
        "messages": [msg.dict() for msg in session.messages]
    }


@router.delete("/{session_id}")
async def end_chat_session(session_id: str):
    """
    End and delete a chat session

    Args:
        session_id: Chat session identifier

    Returns:
        Deletion confirmation
    """
    if session_id not in chat_sessions:
        raise HTTPException(
            status_code=404,
            detail=f"Chat session {session_id} not found"
        )

    del chat_sessions[session_id]

    logger.info(f"Ended chat session {session_id}")

    return {
        "status": "success",
        "message": f"Chat session {session_id} ended"
    }
