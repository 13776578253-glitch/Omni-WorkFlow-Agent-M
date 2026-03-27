import logging
from fastapi import APIRouter, HTTPException
import routers.schemas.auth_schemas as AS
# from typing import 

from functions.auth_functions import AuthFunction


logger = logging.getLogger("auth_functions")

# /auth
router = APIRouter()

# 手机号登录
@router.post("/login_1")
async def auth_phone_number_load_router(data: AS.PhoneLoginRequest) -> AS.LoginResponse:
    phone_number = data.phone
    logger.info("===手机号登录接口开始===")

    user = await AuthFunction.phone_number_log(phone_number)
    if not user: raise HTTPException(status_code=404, detail="手机号错误")

    result = {"user": {'id': user.id, 'name': user.name}}

    logger.info("===手机号登录成功===")
    return result

# 密码登录
@router.post("/login_2")
async def auth_password_load_router(data: AS.PasswordLoginRequest) -> AS.LoginResponse:
    phone_number = data.phone
    password = data.password
    logger.info("===密码登录接口开始===")

    user = await AuthFunction.password_log(phone_number, password)
    if user == 1: raise HTTPException(status_code=404, detail="手机号错误")
    elif user == 2: raise HTTPException(status_code=404, detail="密码错误")
    
    result = {"user": {'id': str(user.id), 'name': user.name}}

    logger.info("===密码登录接口成功===")
    return result

# 注册
@router.post("/register")
async def auth_sign_router(data: AS.RegisterRequest) -> AS.MessageResponse:
    phone_number = data.phone
    password = data.password
    name = data.name
    logger.info("===注册接口开始===")

    user = await AuthFunction.password_sign(phone_number, password, name)
    if not user: raise HTTPException(status_code=404, detail="用户已存在")

    result = {'message': {'code': "0", 'message': "ok", 'data': str(user.id)}}

    logger.info("===注册接口成功===")
    return result

# 重置密码
@router.post("/password/reset")
async def auth_password_reset_router(data: AS.PasswordResetRequest) -> AS.MessageResponse:
    phone_number = data.phone
    password = data.newPassword
    logger.info("===重置密码接口开始===")

    user = await AuthFunction.password_reset(phone_number, password)
    if not user: raise HTTPException(status_code=404, detail="用户不存在")
    if user == 1: raise HTTPException(status_code=404, detail="密码重复")

    result = {'message': {'code': "0", 'message': "ok", 'data': str(user.id)}}

    logger.info("===重置密码接口成功===")
    return result

# 获取用户个性化配置
@router.get("/preferences")
async def auth_preferences_router(data: AS.UserIdRequest) -> AS.PresetConfigRequest:
    user_id = int(data.id)
    logger.info("===获取用户个性化配置接口开始===")

    u_p = await AuthFunction.get_user_reference(user_id)
    if not u_p: raise HTTPException(status_code=404, detail="用户不存在")

    result = {
            'presetMode': u_p.preset_mode.value,
            'presetPrompts': {'custom': u_p.preset_custom, 'concise': u_p.preset_concise, 'formal': u_p.preset_formal},
            'quickActionNames': {'solt1': u_p.quick_name_solt1, 'solt2': u_p.quick_name_solt2, 'solt3': u_p.quick_name_solt3, 'solt4': u_p.quick_name_solt4},
            'quickActionPrompts': {'solt1': u_p.quick_prompt_solt1, 'solt2': u_p.quick_prompt_solt2, 'solt3': u_p.quick_prompt_solt3, 'solt4': u_p.quick_prompt_solt4},
            'memoryContent': u_p.memory_content
        }
    
    logger.info("===获取用户个性化配置接口成功===")
    return result

# 发送验证码
@router.post("/code/send")
async def auth_code_send_router(data: AS.PhoneLoginRequest) -> AS.CodeRequest:
    phone_number = data.phone
    logger.info("===发送验证码接口开始===")

    code = await AuthFunction.generate_code(phone_number)
    if not code: raise HTTPException(status_code=404, detail="用户不存在")

    result = {'requestId': code}

    logger.info("===发送验证码接口成功===")
    return result

