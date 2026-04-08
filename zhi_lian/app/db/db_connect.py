# import asyncpg
import logging
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

try:
    from ..core.config import DATABASE_URL
except ImportError:
    from core.config import DATABASE_URL


logger = logging.getLogger("db_connect")

# 创建异步引擎
engine = create_async_engine(
    DATABASE_URL,
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

