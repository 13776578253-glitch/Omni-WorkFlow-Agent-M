from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.db_connect import Base

class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = {"schema": "public"}
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(Integer, ForeignKey("public.conversations.id", ondelete="CASCADE"), nullable=False)
    message_id = Column(Integer, ForeignKey("public.messages.id", ondelete="CASCADE"), nullable=True)
    task_type = Column(String(50), nullable=True)
    status = Column(String(20), nullable=True)
    input_snapshot = Column(JSONB, nullable=True)
    output_snapshot = Column(JSONB, nullable=True)
    created_at = Column(TIMESTAMP, default=func.now())
    finished_at = Column(TIMESTAMP, nullable=True)

    conversations = relationship(
        "Conversation",
        back_populates="tasks",
        passive_deletes=True
    )
    messages = relationship(
        "Message",
        back_populates="tasks",
        passive_deletes=True
    )
