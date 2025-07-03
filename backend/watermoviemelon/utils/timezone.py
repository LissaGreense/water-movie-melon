from django.conf import settings
from django.utils import timezone
import pytz
from datetime import datetime, time, date


def get_business_timezone():
    """Get the configured business timezone"""
    return pytz.timezone(getattr(settings, 'BUSINESS_TIMEZONE', 'Europe/Warsaw'))


def get_business_day_range(date_input):
    """
    Get start and end of day in business timezone
    Args: date_input can be datetime or date
    Returns: (start_datetime_utc, end_datetime_utc) tuple
    """
    business_tz = get_business_timezone()
    
    # Convert input to date if it's a datetime
    if isinstance(date_input, datetime):
        target_date = date_input.date()
    else:
        target_date = date_input
    
    # Create start and end of day in business timezone
    start_naive = datetime.combine(target_date, time.min)  # 00:00:00
    end_naive = datetime.combine(target_date, time.max)    # 23:59:59.999999
    
    # Localize to business timezone
    start_business = business_tz.localize(start_naive)
    end_business = business_tz.localize(end_naive)
    
    # Convert to UTC
    start_utc = start_business.astimezone(pytz.UTC)
    end_utc = end_business.astimezone(pytz.UTC)
    
    return start_utc, end_utc


def convert_to_business_timezone(utc_datetime):
    """Convert UTC datetime to business timezone"""
    if utc_datetime is None:
        return None
    
    business_tz = get_business_timezone()
    
    # Ensure the datetime is timezone-aware and in UTC
    if timezone.is_naive(utc_datetime):
        utc_datetime = timezone.make_aware(utc_datetime, timezone.utc)
    elif utc_datetime.tzinfo != pytz.UTC:
        utc_datetime = utc_datetime.astimezone(pytz.UTC)
    
    # Convert to business timezone
    return utc_datetime.astimezone(business_tz)


def get_business_date(utc_datetime):
    """Get the calendar date in business timezone"""
    if utc_datetime is None:
        return None
    
    business_datetime = convert_to_business_timezone(utc_datetime)
    if business_datetime is None:
        return None
    return business_datetime.date() 