from pathlib import Path

# 项目根目录 app/
BASE_DIR = Path(__file__).resolve().parents[1]

# 日志
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)
LOG_FILE = LOG_DIR / "zhi_lian.log"
LOG_LEVEL = "INFO"

# 数据库
DB_FILE = "postgresql+asyncpg://zhilian:123456@db:5432/zhilian_db"
