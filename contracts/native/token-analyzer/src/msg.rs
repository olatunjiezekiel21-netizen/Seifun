use cosmwasm_schema::{cw_serde, QueryResponses};
use serde::{Deserialize, Serialize};

use crate::state::{TokenAnalysis, TokenInfo};

#[cw_serde]
pub struct InstantiateMsg {
    pub admin: Option<String>,
}

#[cw_serde]
pub enum ExecuteMsg {
    AnalyzeToken { denom: String },
    UpdateTokenInfo { denom: String, info: TokenInfo },
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(TokenAnalysis)]
    GetTokenAnalysis { denom: String },
    
    #[returns(TokenInfo)]
    GetTokenInfo { denom: String },
    
    #[returns(Vec<(String, TokenAnalysis)>)]
    ListTokens {},
}