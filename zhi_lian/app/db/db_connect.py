# import asyncpg
import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from contextlib import asynccontextmanager
from core.config import DB_FILE


logger = logging.getLogger("db_connect")

# 创建异步引擎
engine = create_async_engine(
    DB_FILE,
    # echo=True,  # 可以看到SQL语句
)

# 创建Session工厂
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base类
Base = declarative_base()

@asynccontextmanager
async def db_context():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            logger.info(f"回滚Exception:{Exception}")
            raise

