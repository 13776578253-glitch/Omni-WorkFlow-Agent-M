from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.db_connect import Base
import enum

class PresetModeEnum(enum.Enum):
    custom = "custom"
    concise = "concise"
    formal = "formal"

class UserPreference(Base):
    __tablename__ = "user_preferences"
    __table_args__ = {"schema": "public"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("public.users.id", ondelete="CASCADE"), nullable=False)
    preset_mode = Column(Enum(PresetModeEnum), nullable=False, default=PresetModeEnum.custom)
    preset_custom = Column(Text, nullable=True, default="", comment="自定义预设指令")
    preset_concise = Column(Text, nullable=False, comment="简洁版预设指令")
    preset_formal = Column(Text, nullable=False, comment="正式版预设指令")
    quick_name_solt1 = Column(String(255), nullable=True, default="", comment="快捷位1名称")
    quick_name_solt2 = Column(String(255), nullable=True, default="", comment="快捷位2名称")
    quick_name_solt3 = Column(String(255), nullable=True, default="", comment="快捷位3名称")
    quick_name_solt4 = Column(String(255), nullable=True, default="", comment="快捷位4名称")
    quick_prompt_solt1 = Column(Text, nullable=True, default="", comment="快捷位1提示词")
    quick_prompt_solt2 = Column(Text, nullable=True, default="", comment="快捷位2提示词")
    quick_prompt_solt3 = Column(Text, nullable=True, default="", comment="快捷位3提示词")
    quick_prompt_solt4 = Column(Text, nullable=True, default="", comment="快捷位4提示词")
    memory_content = Column(Text, nullable=True, default="", comment="长期记忆内容")
    version = Column(Integer, nullable=False, default=1, comment="版本号")
    created_at = Column(TIMESTAMP, nullable=False, default=func.current_timestamp(), comment="创建时间")
    updated_at = Column(TIMESTAMP, nullable=False, default=func.current_timestamp(), onupdate=func.current_timestamp(), comment="更新时间")

    users = relationship(
        "User", 
        back_populates="user_preferences",
        passive_deletes=True
    )

    