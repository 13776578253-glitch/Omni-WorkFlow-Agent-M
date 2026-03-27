from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.db_connect import Base

class File(Base):
    __tablename__ = "files"
    __table_args__ = {"schema": "public"}
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("public.users.id", ondelete="CASCADE"), nullable=False)
    message_id = Column(Integer, ForeignKey("public.messages.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(100), nullable=True)
    file_type = Column(String(50), nullable=True)
    file_url = Column(String(100), nullable=True)
    file_size = Column(Integer, nullable=True)
    created_at = Column(TIMESTAMP, default=func.now())

    users = relationship(
        "User", 
        back_populates="files",
        passive_deletes=True
    )
    messages = relationship(
        "Message",
        back_populates="files",
        passive_deletes=True
    )

