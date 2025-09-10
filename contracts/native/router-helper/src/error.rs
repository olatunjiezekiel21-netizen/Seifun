use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("Invalid amount")]
    InvalidAmount {},

    #[error("Same token")]
    SameToken {},

    #[error("Trade expired")]
    TradeExpired {},

    #[error("Order expired")]
    OrderExpired {},

    #[error("Order not found")]
    OrderNotFound {},

    #[error("Order not active")]
    OrderNotActive {},

    #[error("Insufficient output amount")]
    InsufficientOutputAmount {},

    #[error("Insufficient liquidity")]
    InsufficientLiquidity {},

    #[error("Insufficient balance")]
    InsufficientBalance {},

    #[error("Fee collection inactive")]
    FeeCollectionInactive {},

    #[error("Invalid fee rate")]
    InvalidFeeRate {},

    #[error("Unsupported token: {token}")]
    UnsupportedToken { token: String },
}