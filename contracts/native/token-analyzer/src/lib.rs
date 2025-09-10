use cosmwasm_std::{
    entry_point, to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult,
};
use cw_storage_plus::Map;
use serde::{Deserialize, Serialize};

use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg};
use crate::state::{TokenAnalysis, TokenInfo, TOKEN_ANALYSES};

pub mod msg;
pub mod state;

#[entry_point]
pub fn instantiate(
    _deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    _msg: InstantiateMsg,
) -> StdResult<Response> {
    Ok(Response::new().add_attribute("method", "instantiate"))
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    match msg {
        ExecuteMsg::AnalyzeToken { denom } => execute_analyze_token(deps, env, info, denom),
        ExecuteMsg::UpdateTokenInfo { denom, info: token_info } => {
            execute_update_token_info(deps, env, info, denom, token_info)
        }
    }
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetTokenAnalysis { denom } => {
            let analysis = TOKEN_ANALYSES.load(deps.storage, &denom)?;
            to_binary(&analysis)
        }
        QueryMsg::GetTokenInfo { denom } => {
            let analysis = TOKEN_ANALYSES.load(deps.storage, &denom)?;
            to_binary(&analysis.token_info)
        }
        QueryMsg::ListTokens {} => {
            let tokens: StdResult<Vec<_>> = TOKEN_ANALYSES
                .range(deps.storage, None, None, cosmwasm_std::Order::Ascending)
                .collect();
            to_binary(&tokens?)
        }
    }
}

pub fn execute_analyze_token(
    deps: DepsMut,
    env: Env,
    _info: MessageInfo,
    denom: String,
) -> StdResult<Response> {
    // Perform token analysis
    let analysis = analyze_native_token(deps.as_ref(), &env, &denom)?;
    
    // Store the analysis
    TOKEN_ANALYSES.save(deps.storage, &denom, &analysis)?;
    
    Ok(Response::new()
        .add_attribute("method", "analyze_token")
        .add_attribute("denom", denom)
        .add_attribute("risk_level", analysis.risk_level.to_string())
        .add_attribute("is_verified", analysis.is_verified.to_string()))
}

pub fn execute_update_token_info(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    denom: String,
    token_info: TokenInfo,
) -> StdResult<Response> {
    // Load existing analysis or create new one
    let mut analysis = TOKEN_ANALYSES
        .load(deps.storage, &denom)
        .unwrap_or_else(|_| TokenAnalysis {
            token_info: token_info.clone(),
            risk_level: "unknown".to_string(),
            is_verified: false,
            warnings: vec![],
            last_analyzed: 0,
        });
    
    // Update token info
    analysis.token_info = token_info;
    analysis.last_analyzed = cosmwasm_std::Timestamp::seconds(0).seconds(); // Current time
    
    // Save updated analysis
    TOKEN_ANALYSES.save(deps.storage, &denom, &analysis)?;
    
    Ok(Response::new()
        .add_attribute("method", "update_token_info")
        .add_attribute("denom", denom))
}

fn analyze_native_token(deps: Deps, env: &Env, denom: &str) -> StdResult<TokenAnalysis> {
    // Get token info from bank module
    let token_info = get_token_info_from_bank(deps, denom)?;
    
    // Perform risk analysis
    let (risk_level, warnings) = analyze_token_risk(denom, &token_info);
    
    // Check if token is verified (this would integrate with a token registry)
    let is_verified = is_token_verified(denom);
    
    Ok(TokenAnalysis {
        token_info,
        risk_level,
        is_verified,
        warnings,
        last_analyzed: env.block.time.seconds(),
    })
}

fn get_token_info_from_bank(deps: Deps, denom: &str) -> StdResult<TokenInfo> {
    // Query bank module for token metadata
    let query = cosmwasm_std::BankQuery::DenomMetadata { denom: denom.to_string() };
    let res: cosmwasm_std::DenomMetadata = deps.querier.query(&query.into())?;
    
    Ok(TokenInfo {
        denom: denom.to_string(),
        name: res.name,
        symbol: res.symbol,
        decimals: res.denom_units
            .iter()
            .find(|unit| unit.denom == denom)
            .map(|unit| unit.exponent)
            .unwrap_or(6),
        total_supply: "0".to_string(), // Would need separate query
        is_native: denom == "usei",
        is_ibc: denom.starts_with("ibc/"),
        is_cw20: denom.starts_with("sei1"),
        description: res.description,
        image: None,
        website: None,
        twitter: None,
        telegram: None,
    })
}

fn analyze_token_risk(denom: &str, token_info: &TokenInfo) -> (String, Vec<String>) {
    let mut warnings = Vec::new();
    let mut risk_score = 0;
    
    // Check for suspicious patterns
    if denom.contains("scam") || denom.contains("fake") {
        warnings.push("Token denom contains suspicious keywords".to_string());
        risk_score += 50;
    }
    
    // Check for very long denoms
    if denom.len() > 50 {
        warnings.push("Unusually long token denom".to_string());
        risk_score += 20;
    }
    
    // Native tokens are generally safer
    if token_info.is_native {
        risk_score -= 30;
    }
    
    // IBC tokens require additional verification
    if token_info.is_ibc {
        warnings.push("IBC token - verify source chain and token authenticity".to_string());
        risk_score += 10;
    }
    
    // CW20 tokens need contract verification
    if token_info.is_cw20 {
        warnings.push("CW20 token - verify contract code and ownership".to_string());
        risk_score += 15;
    }
    
    // Determine risk level
    let risk_level = if risk_score >= 50 {
        "high"
    } else if risk_score >= 20 {
        "medium"
    } else {
        "low"
    };
    
    (risk_level.to_string(), warnings)
}

fn is_token_verified(denom: &str) -> bool {
    // Known verified tokens
    let verified_tokens = ["usei"]; // Add more as needed
    verified_tokens.contains(&denom)
}