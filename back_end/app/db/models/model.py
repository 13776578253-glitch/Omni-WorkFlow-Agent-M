from sqlalchemy import Column, Integer, String
from db.db_connect import Base

class Model(Base):
    __tablename__ = "model"
    __table_args__ = {"schema": "public"}
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)