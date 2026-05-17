from datetime import datetime, timezone
import pytz

tz_india = pytz.timezone('Asia/Kolkata')

def utc_now() -> datetime:
    """Returns current UTC time as a timezone-aware datetime.
    Replaces deprecated datetime.utcnow() (deprecated since Python 3.12).
    """
    return datetime.now(timezone.utc)



    