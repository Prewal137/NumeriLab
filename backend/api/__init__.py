"""NumeriLab API Routers Package.

Exposes APIRouter modules for each of the 5 numerical method modules.
"""

from .module1 import router as module1_router
from .module2 import router as module2_router
from .module3 import router as module3_router
from .module4 import router as module4_router
from .module5 import router as module5_router

__all__ = [
    "module1_router",
    "module2_router",
    "module3_router",
    "module4_router",
    "module5_router",
]
