class ChainError(RuntimeError):
    """Base class for expected chain-access failures."""


class ChainRpcError(ChainError):
    def __init__(self, message: str, *, method: str | None = None) -> None:
        super().__init__(message)
        self.method = method


class ChainConfigurationError(ChainError):
    """The configured chain settings do not match the RPC endpoint."""
