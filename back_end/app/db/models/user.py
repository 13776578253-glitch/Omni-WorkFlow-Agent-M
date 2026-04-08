from sqlalchemy import Column, Integer, String, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.db_connect import Base
# from ..db_connect import Base

# User模型
class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "public"}
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    account = Column(String(50), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    phone_number = Column(String(20), unique=True, nullable=True)
    name = Column(String(50), nullable=False)
    role = Column(String(50), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, default=func.now())

    user_preferences = relationship(
        "UserPreference",
        back_populates="users",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    conversations = relationship(
        "Conversation",
        back_populates="users",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    files = relationship(
        "File",
        back_populates="users",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

