from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.db_connect import Base

class Message(Base):
    __tablename__ = "messages"
    __table_args__ = {"schema": "public"}
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(Integer, ForeignKey("public.conversations.id", ondelete="CASCADE"), nullable=False)
    model_id = Column(Integer, ForeignKey("public.model.id"), nullable=False)
    role = Column(String(50), nullable=True)
    content = Column(Text, nullable=True)
    content_type = Column(String(50), nullable=True)
    created_at = Column(TIMESTAMP, default=func.now())

    conversations = relationship(
        "Conversation",
        back_populates="messages",
        passive_deletes=True
    )
    tasks = relationship(
        "Task",
        back_populates="messages",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    files = relationship(
        "File",
        back_populates="messages",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

