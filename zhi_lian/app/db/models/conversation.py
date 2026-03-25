from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.db_connect import Base

class Conversation(Base):
    __tablename__ = "conversations"
    __table_args__ = {"schema": "public"}
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("public.users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(50), nullable=True)
    scene_type = Column(String(50), nullable=True)
    status = Column(String(20), nullable=True)
    created_at = Column(TIMESTAMP, default=func.now())
    updated_at = Column(TIMESTAMP, default=func.now(), onupdate=func.now())

    users = relationship(
        "User", 
        back_populates="conversations",
        passive_deletes=True
    )
    messages = relationship(
        "Message",
        back_populates="conversations",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    tasks = relationship(
        "Task",
        back_populates="conversations",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    