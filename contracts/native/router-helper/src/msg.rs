use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::{Addr, Uint128, Decimal};

#[cw_serde]
pub struct InstantiateMsg {
    pub admin: String,
    pub fee_collector: String,
    pub order_book: String,
    pub amm_factory: String,
}

#[cw_serde]
pub enum ExecuteMsg {
    // Trade execution
    ExecuteMarketTrade {
        token_in: String,
        token_out: String,
        amount_in: Uint128,
        min_amount_out: Uint128,
        deadline: u64,
    },
    
    // Order management
    CreateLimitOrder {
        token_in: String,
        token_out: String,
        amount_in: Uint128,
        price: Decimal,
        deadline: u64,
    },
    
    CancelOrder {
        order_id: String,
    },
    
    // Liquidity management
    AddLiquidity {
        token_a: String,
        token_b: String,
        amount_a: Uint128,
        amount_b: Uint128,
        min_liquidity: Uint128,
    },
    
    RemoveLiquidity {
        token_a: String,
        token_b: String,
        liquidity: Uint128,
        min_amount_a: Uint128,
        min_amount_b: Uint128,
    },
    
    // Admin functions
    UpdateConfig {
        admin: Option<String>,
        fee_collector: Option<String>,
        order_book: Option<String>,
        amm_factory: Option<String>,
    },
    
    UpdateFeeRate {
        token: String,
        rate: Decimal,
    },
    
    EmergencyWithdraw {
        token: String,
        amount: Uint128,
    },
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(ConfigResponse)]
    Config {},
    
    #[returns(OrderResponse)]
    Order { order_id: String },
    
    #[returns(OrdersResponse)]
    UserOrders { user: String },
    
    #[returns(LiquidityResponse)]
    UserLiquidity { user: String, token: String },
    
    #[returns(FeeInfoResponse)]
    FeeInfo { token: String },
    
    #[returns(StatsResponse)]
    Stats {},
}

#[cw_serde]
pub struct ConfigResponse {
    pub admin: Addr,
    pub fee_collector: Addr,
    pub order_book: Addr,
    pub amm_factory: Addr,
}

#[cw_serde]
pub struct OrderResponse {
    pub order: Option<Order>,
}

#[cw_serde]
pub struct Order {
    pub user: Addr,
    pub token_in: String,
    pub token_out: String,
    pub amount_in: Uint128,
    pub min_amount_out: Uint128,
    pub price: Decimal,
    pub trade_type: TradeType,
    pub deadline: u64,
    pub is_active: bool,
    pub order_id: String,
}

#[cw_serde]
pub enum TradeType {
    Market,
    Limit,
    StopLoss,
    TakeProfit,
}

#[cw_serde]
pub struct OrdersResponse {
    pub orders: Vec<String>,
}

#[cw_serde]
pub struct LiquidityResponse {
    pub balance: Uint128,
}

#[cw_serde]
pub struct FeeInfoResponse {
    pub rate: Decimal,
    pub collected: Uint128,
    pub is_active: bool,
}

#[cw_serde]
pub struct StatsResponse {
    pub total_trades: u64,
    pub total_volume: Uint128,
    pub last_trade_time: u64,
}