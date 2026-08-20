# -*- coding: utf-8 -*-
"""
让 spider 目录成为可导入的包（解决 from spider import xxx 的模块路径问题）
同时提供 run_all() 公共API供其他模块调用
"""
from pathlib import Path
import sys

# 确保项目根目录在 sys.path 中（DrissionPage + crawler_utils 能被正常导入）
_PROJECT_ROOT = Path(__file__).parent.parent.absolute()
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))
