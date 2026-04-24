from datetime import datetime
import pytz

tz_india = pytz.timezone('Asia/Kolkata')

def now_ist(format_str: str = "%Y-%m-%d %I:%M:%S %p") -> str:
    """Returns current date and time in IST formatted as per given format string."""
    now_india = datetime.now(tz_india)
    return now_india.strftime(format_str)

    