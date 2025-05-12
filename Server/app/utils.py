# app/utils.py
import asyncio
from config import config


def is_allowed_audio_file(filename: str) -> bool:
    """Checks if the filename has an allowed audio extension."""
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in config.ALLOWED_AUDIO_EXTENSIONS


async def run_blocking_io(func, *args, **kwargs):
    """Runs blocking I/O function in a separate thread."""
    return await asyncio.to_thread(func, *args, **kwargs)
