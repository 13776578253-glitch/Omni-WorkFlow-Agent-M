from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

try:
    from ..core.config import get_all_data_source_strategies, get_data_source_strategy
except ImportError:
    from app.core.config import get_all_data_source_strategies, get_data_source_strategy


DataSourceStrategy = Literal["mock_only", "db_preferred_with_mock_fallback", "db_only"]


@dataclass(frozen=True)
class ModuleDataSourceBinding:
    module: str
    strategy: DataSourceStrategy

    @property
    def db_enabled(self) -> bool:
        return self.strategy in ("db_preferred_with_mock_fallback", "db_only")

    @property
    def mock_enabled(self) -> bool:
        return self.strategy in ("mock_only", "db_preferred_with_mock_fallback")


def get_module_binding(module_name: str) -> ModuleDataSourceBinding:
    return ModuleDataSourceBinding(
        module=module_name,
        strategy=get_data_source_strategy(module_name), # type: ignore
    )


def get_all_module_bindings() -> dict[str, ModuleDataSourceBinding]:
    return {
        module_name: ModuleDataSourceBinding(module_name, strategy) # type: ignore
        for module_name, strategy in get_all_data_source_strategies().items()
    }
