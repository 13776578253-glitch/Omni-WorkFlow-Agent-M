import logging
from db.models.user import User
from db.db_operations.user_preference_operation import UserPreferenceOperation
from db.db_connect import db_context
from sqlalchemy import select


class UserOperation:
    logger = logging.getLogger("user_operation")

    # 查询用户
    @classmethod
    async def get_user_by(cls, data_type, data):
        field_map = {"id": User.id, "account": User.account, "phone_number": User.phone_number, "name": User.name}
        if data_type not in field_map: 
            cls.logger.error(f"field_map{field_map}不存在")
            return None
        
        async with db_context() as session:
            result = await session.execute(select(User).where(field_map[data_type] == data))

        cls.logger.info(f"已查询{data_type}为{data}的用户信息")
        return result.scalars().all()

    # 创建用户
    @classmethod
    async def create_user_password(cls, phone_number, password_hash, name, role):
        async with db_context() as session:
            user = User(phone_number=phone_number, password_hash=password_hash, name=name, role=role)
            session.add(user)
            
        user_preference = await UserPreferenceOperation.create_user_preferrnce(user.id)

        cls.logger.info("已创建用户")
        return user
        
    # 修改用户信息
    @classmethod
    async def modify_user(cls, user_id, account=None, password_hash=None, name=None, role=None, avatar_url=None):
        async with db_context() as session:
            result = await session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()

            if account is not None: user.account = account
            if password_hash is not None: user.password_hash = password_hash
            if name is not None: user.name = name
            if role is not None: user.role = role
            if avatar_url is not None: user.avatar_url = avatar_url

        cls.logger.info("已修改用户信息")
        return user
        
    # 删除用户
    @classmethod
    async def delete_user(cls, user_id):
        async with db_context() as session:
            result = await session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()

            if not user: return False
            await session.delete(user)

        cls.logger.info("已删除用户信息")
        return user

    # 获取全部用户
    @classmethod
    async def get_all_users(cls):
        async with db_context() as session:
            users = await session.execute(select(User))
            result = users.scalars().all()
        return result


if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    asyncio.run(UserOperation.get_all_users())

