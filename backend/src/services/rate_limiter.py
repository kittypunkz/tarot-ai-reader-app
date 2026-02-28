"""
Rate Limiter Service
Prevents spam and abuse
US-001: Rate limiting (5 requests/minute/IP)
"""

import os
import time
from typing import Dict, Tuple
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio


class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        self.requests: Dict[str, list] = defaultdict(list)
        self.limit = int(os.getenv("RATE_LIMIT_REQUESTS_PER_MINUTE", "5"))
        self.window = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
        self._lock = asyncio.Lock()
    
    async def check_rate_limit(self, key: str) -> bool:
        """
        Check if request is within rate limit
        
        Args:
            key: Rate limit key (IP:session)
            
        Returns:
            True if allowed, False if rate limited
        """
        async with self._lock:
            now = time.time()
            window_start = now - self.window
            
            # Clean old requests
            self.requests[key] = [
                ts for ts in self.requests[key] 
                if ts > window_start
            ]
            
            # Check limit
            if len(self.requests[key]) >= self.limit:
                return False
            
            # Record this request
            self.requests[key].append(now)
            return True
    
    async def get_rate_limit_info(self, key: str) -> dict:
        """Get current rate limit status"""
        async with self._lock:
            now = time.time()
            window_start = now - self.window
            
            # Clean and count
            self.requests[key] = [
                ts for ts in self.requests[key] 
                if ts > window_start
            ]
            
            remaining = max(0, self.limit - len(self.requests[key]))
            
            # Calculate reset time
            if self.requests[key]:
                oldest = min(self.requests[key])
                reset_after = int(oldest + self.window - now)
            else:
                reset_after = 0
            
            return {
                "limit": self.limit,
                "remaining": remaining,
                "reset_after": max(0, reset_after)
            }
