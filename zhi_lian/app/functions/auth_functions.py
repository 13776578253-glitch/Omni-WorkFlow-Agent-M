import logging, string, random
from passlib.context import CryptContext
from db.db_operations.user_operation import UserOperation
from db.db_operations.user_preference_operation import UserPreferenceOperation


class AuthFunction:
    logger = logging.getLogger("auth_functions")
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    # 加密密码
    @classmethod
    def _hash_password(cls, password):
        return cls.pwd_context.hash(password)

    # 验证密码
    @classmethod
    def _verify_password(cls, password, hashed):
        return cls.pwd_context.verify(password, hashed)

    # 生成随机数字+大小写字母混合验证码
    @classmethod
    def generate_mix_verify_code(cls, code_length=6):
        char_pool = string.digits + string.ascii_letters
        verify_code = ''.join(random.choice(char_pool) for _ in range(code_length))
        return verify_code
    
    # 对比密码
    @classmethod
    async def verify_password(cls, phone_number, password, user=None):
        if not user: user = await UserOperation.get_user_by("phone_number", phone_number)
        user_password = user.password_hash
        return cls._verify_password(password, user_password)

    # 用户是否存在 False不存在 True存在
    @classmethod
    async def if_exist(cls, data_dict, t_f=False, user=False):
        key = list(data_dict.keys())[0]
        exist = await UserOperation.get_user_by(key, data_dict[key])

        bool_exist = not (bool(exist) ^ t_f)
        text_exist = '不存在' # False
        if t_f: text_exist = '已存在' # True
        if user: user = exist

        if bool_exist:
            cls.logger.error(f"用户{text_exist}")
            return {'user': user, 'result':False}
        else:
            return {'user': user, 'result':True}
        
    # 生成验证码
    @classmethod
    async def generate_code(cls, phone_number):
        exist = await cls.if_exist({'phone_number': phone_number}, t_f=False, user=True)
        if not exist['result']: return False
        
        code = cls.generate_mix_verify_code()
        cls.logger.info("已生成验证码")

        return code

    # 注册
    @classmethod
    async def password_sign(cls, phone_number, password, name, role='user'):
        exist = await cls.if_exist({'phone_number': phone_number}, t_f=True, user=True)
        if not exist['result']: return False
        
        password_hash = cls._hash_password(password)
        user = await UserOperation.create_user_password(phone_number, password_hash, name, role)
        cls.logger.info(f"用户{user.id}注册成功")

        return user

    # 密码登录
    @classmethod
    async def password_log(cls, phone_number, password):
        exist = await cls.if_exist({'phone_number': phone_number}, t_f=False, user=True)
        if not exist['result']: return 1

        user = exist['user'][0]
        result = await cls.verify_password(phone_number, password, user=user)

        if result:
            cls.logger.info(f"用户{user.id}登录成功{phone_number}")
            return user
        else:
            return 2

    # 手机号登录
    @classmethod
    async def phone_number_log(cls, phone_number):
        exist = await cls.if_exist({'phone_number': phone_number}, t_f=False, user=True)
        if not exist['result']: return False

        user = exist['user'][0]
        cls.logger.info(f"用户{user.id}登录成功{phone_number}")
        return user
    
    # 重置密码
    @classmethod
    async def password_reset(cls, phone_number, password):
        exist = await cls.if_exist({'phone_number': phone_number}, t_f=False, user=True)
        if not exist['result']: return False

        user = exist['user'][0]
        result = await cls.verify_password(phone_number, password, user=user)
        if result:
            cls.logger.error("密码重复")
            return 1

        password_hash = cls._hash_password(password)
        result_user = await UserOperation.modify_user(user.id, password_hash=password_hash)
        cls.logger.info(f"用户{user.id}-{result_user.id}重置密码成功")

        return result_user
    
    # 获取用户个性化配置
    @classmethod
    async def get_user_reference(cls, user_id):
        exist = await cls.if_exist({'id': user_id}, t_f=False, user=True)
        if not exist['result']: return False

        user_reference = await UserPreferenceOperation.get_user_by('user_id', user_id)
        u_p = user_reference[0]
        cls.logger.info(f"查询{user_id}个性化配置成功")

        return u_p

        
if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    asyncio.run(AuthFunction.get_user_reference(1)) # phone_number_log('13914060518')'13914060518', '123456', '1st'  '1','1','1'