import asyncio
import logging
import os
from time import sleep
from typing import Dict, Optional

from databases import Database
from loguru import logger

from app.core.config import ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME
from app.models.user import UserCreate
from initial_data.utils import create_user, init_database

# injected from .env with starlette config
USERS: Dict[str, UserCreate] = {
    "admin": UserCreate(
        username=ADMIN_USERNAME,
        email=ADMIN_EMAIL,
        password=ADMIN_PASSWORD,
    ),
}


async def main():
    database = await init_database()
    err = await create_user(
        database,
        USERS["admin"],
        admin=True,
        verified=True,
    )
    logger.info(f'Created superuser {USERS["admin"].email}') if not err else logger.exception(err)


if __name__ == "__main__":
    asyncio.run(main())
