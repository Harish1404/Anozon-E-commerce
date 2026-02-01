from datetime import datetime
import pytz

# Set timezone to India
tz_india = pytz.timezone('Asia/Kolkata')
now_india = datetime.now(tz_india)

# Format as hh:mm:ss a (e.g., 08:40:53 PM)
formatted_time = now_india.strftime('%I:%M:%S %p')

def now_ist(format_str: str = "%I:%M:%S %p") -> str:
    """Returns current time in IST formatted as per given format string."""
    now_india = datetime.now(tz_india)
    return now_india.strftime(format_str)