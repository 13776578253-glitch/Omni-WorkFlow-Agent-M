import logging
import db.models
from db.db_connect import engine, Base


# DROP SCHEMA public CASCADE; CREATE SCHEMA public;
async def init_db():
    logger = logging.getLogger("init_operation")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("已初始化表格")


if __name__ == "__main__":
    from core.logger import setup_logging
    setup_logging()

    import asyncio
    asyncio.run(init_db())