import os


def get_bool_env(name: str, default=False) -> bool:
    """
    Safely retrieves a boolean value from environment variables.
    Converts string values like 'true', '1', 'yes', 'y' (case-insensitive) to True.
    """
    val = os.environ.get(name, str(default)).strip().lower()
    return val in ('true', '1', 'yes', 'y') 