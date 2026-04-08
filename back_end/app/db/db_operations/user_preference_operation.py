import logging
from datetime import datetime

from db.models.user_preference import UserPreference
from db.db_connect import db_context
from sqlalchemy import select


class UserPreferenceOperation:
    logger = logging.getLogger("user_preference_operation")
    preset_mode = ''
    presetPrompts = {"preset_custom": '', "preset_concise": '', "preset_formal": ''}
    quickActionNames = {}
    quickActionPrompts = {}

    # 查询用户个性化信息
    @classmethod
    async def get_user_by(cls, data_type, data):
        field_map = {"user_id": UserPreference.user_id}
        if data_type not in field_map: 
            cls.logger.error(f"field_map{field_map}不存在")
            return None
        
        async with db_context() as session:
            result = await session.execute(select(UserPreference).where(field_map[data_type] == data))
            cls.logger.info(f"已查询{data_type}为{data}的用户个性化信息")
        return result.scalars().all()
    
    # 创建用户个性化信息
    @classmethod
    async def create_user_preferrnce(cls, user_id, presetPrompts=None, quickActionNames=None, quickActionPrompts=None, created_at=datetime.now()):
        async with db_context() as session:
            user_preferrnce = UserPreference(user_id=user_id, preset_concise=cls.presetPrompts['preset_concise'], preset_formal=cls.presetPrompts['preset_formal'])
            session.add(user_preferrnce)

        cls.logger.info("已创建用户个性化信息")
        return user_preferrnce
