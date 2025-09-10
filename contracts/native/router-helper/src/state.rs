use cosmwasm_std::{Addr, Uint128, Decimal};
use cw_storage_plus::{Item, Map};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {
    pub admin: Addr,
    pub fee_collector: Addr,
    pub order_book: Addr,
    pub amm_factory: Addr,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
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

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub enum TradeType {
    Market,
    Limit,
    StopLoss,
    TakeProfit,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct FeeInfo {
    pub rate: Decimal,
    pub collected: Uint128,
    pub is_active: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Stats {
    pub total_trades: u64,
    pub total_volume: Uint128,
    pub last_trade_time: u64,
}

// Storage items
pub const CONFIG: Item<Config> = Item::new("config");
pub const ORDERS: Map<String, Order> = Map::new("orders");
pub const USER_ORDERS: Map<Addr, Vec<String>> = Map::new("user_orders");
pub const LIQUIDITY_BALANCES: Map<(Addr, String), Uint128> = Map::new("liquidity_balances");
pub const FEE_RATES: Map<String, FeeInfo> = Map::new("fee_rates");
pub const STATS: Item<Stats> = Item::new("stats");