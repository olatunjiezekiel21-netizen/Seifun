use cosmwasm_schema::cw_serde;
use cw_storage_plus::Map;
use serde::{Deserialize, Serialize};

#[cw_serde]
pub struct TokenInfo {
    pub denom: String,
    pub name: String,
    pub symbol: String,
    pub decimals: u32,
    pub total_supply: String,
    pub is_native: bool,
    pub is_ibc: bool,
    pub is_cw20: bool,
    pub description: Option<String>,
    pub image: Option<String>,
    pub website: Option<String>,
    pub twitter: Option<String>,
    pub telegram: Option<String>,
}

#[cw_serde]
pub struct TokenAnalysis {
    pub token_info: TokenInfo,
    pub risk_level: String, // "low", "medium", "high"
    pub is_verified: bool,
    pub warnings: Vec<String>,
    pub last_analyzed: u64,
}

// Storage for token analyses
pub const TOKEN_ANALYSES: Map<String, TokenAnalysis> = Map::new("token_analyses");