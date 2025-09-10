use cosmwasm_std::{
    entry_point, to_binary, Binary, Deps, DepsMut, Env, MessageInfo,
    Response, StdResult, Uint128, Addr, Timestamp, CosmosMsg, WasmMsg,
    QueryRequest, WasmQuery, ContractInfo, ContractResult, Empty,
    coins, BankMsg, coin
};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct InstantiateMsg {
    pub admin: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ExecuteMsg {
    // Context Store
    StoreContext {
        user_query: String,
        ai_response: String,
        transaction_hash: String,
        success: bool,
    },
    
    // Portfolio Management
    UpdatePortfolio {
        user: String,
        total_value: Uint128,
    },
    
    // Staking
    Stake {
        amount: Uint128,
    },
    
    Unstake {
        stake_id: u64,
    },
    
    // Lending
    Borrow {
        amount: Uint128,
    },
    
    Repay {
        loan_id: u64,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    // Context Store
    GetContext { context_id: u64 },
    GetUserContexts { user: String },
    
    // Portfolio
    GetPortfolio { user: String },
    
    // Staking
    GetStake { stake_id: u64 },
    GetUserStakes { user: String },
    CalculateRewards { stake_id: u64 },
    
    // Lending
    GetLoan { loan_id: u64 },
    GetUserLoans { user: String },
    CalculateInterest { loan_id: u64 },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Context {
    pub id: u64,
    pub user: String,
    pub user_query: String,
    pub ai_response: String,
    pub transaction_hash: String,
    pub timestamp: Timestamp,
    pub success: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Portfolio {
    pub user: String,
    pub total_value: Uint128,
    pub last_update: Timestamp,
    pub active: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Stake {
    pub id: u64,
    pub user: String,
    pub amount: Uint128,
    pub start_time: Timestamp,
    pub end_time: Timestamp,
    pub active: bool,
    pub rewards: Uint128,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Loan {
    pub id: u64,
    pub borrower: String,
    pub amount: Uint128,
    pub interest_rate: u64, // 8% = 800
    pub start_time: Timestamp,
    pub due_time: Timestamp,
    pub active: bool,
    pub repaid: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct State {
    pub admin: Addr,
    pub context_id: u64,
    pub stake_id: u64,
    pub loan_id: u64,
}

pub const STATE_KEY: &[u8] = b"state";
pub const CONTEXT_PREFIX: &[u8] = b"context";
pub const USER_CONTEXT_PREFIX: &[u8] = b"user_context";
pub const PORTFOLIO_PREFIX: &[u8] = b"portfolio";
pub const STAKE_PREFIX: &[u8] = b"stake";
pub const USER_STAKE_PREFIX: &[u8] = b"user_stake";
pub const LOAN_PREFIX: &[u8] = b"loan";
pub const USER_LOAN_PREFIX: &[u8] = b"user_loan";

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    let admin = deps.api.addr_validate(&msg.admin)?;
    
    let state = State {
        admin,
        context_id: 0,
        stake_id: 0,
        loan_id: 0,
    };
    
    deps.storage.set(STATE_KEY, &to_binary(&state)?);
    
    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("admin", msg.admin))
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    match msg {
        ExecuteMsg::StoreContext { user_query, ai_response, transaction_hash, success } => {
            execute_store_context(deps, env, info, user_query, ai_response, transaction_hash, success)
        },
        ExecuteMsg::UpdatePortfolio { user, total_value } => {
            execute_update_portfolio(deps, env, info, user, total_value)
        },
        ExecuteMsg::Stake { amount } => {
            execute_stake(deps, env, info, amount)
        },
        ExecuteMsg::Unstake { stake_id } => {
            execute_unstake(deps, env, info, stake_id)
        },
        ExecuteMsg::Borrow { amount } => {
            execute_borrow(deps, env, info, amount)
        },
        ExecuteMsg::Repay { loan_id } => {
            execute_repay(deps, env, info, loan_id)
        },
    }
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetContext { context_id } => to_binary(&query_context(deps, context_id)?),
        QueryMsg::GetUserContexts { user } => to_binary(&query_user_contexts(deps, user)?),
        QueryMsg::GetPortfolio { user } => to_binary(&query_portfolio(deps, user)?),
        QueryMsg::GetStake { stake_id } => to_binary(&query_stake(deps, stake_id)?),
        QueryMsg::GetUserStakes { user } => to_binary(&query_user_stakes(deps, user)?),
        QueryMsg::CalculateRewards { stake_id } => to_binary(&query_calculate_rewards(deps, stake_id)?),
        QueryMsg::GetLoan { loan_id } => to_binary(&query_loan(deps, loan_id)?),
        QueryMsg::GetUserLoans { user } => to_binary(&query_user_loans(deps, user)?),
        QueryMsg::CalculateInterest { loan_id } => to_binary(&query_calculate_interest(deps, loan_id)?),
    }
}

// Implementation functions would go here...
// For brevity, I'll include the key ones:

fn execute_store_context(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    user_query: String,
    ai_response: String,
    transaction_hash: String,
    success: bool,
) -> StdResult<Response> {
    let mut state: State = deps.storage.get(STATE_KEY)
        .ok_or_else(|| cosmwasm_std::StdError::NotFound { kind: "State".to_string() })?
        .try_into()?;
    
    state.context_id += 1;
    
    let context = Context {
        id: state.context_id,
        user: info.sender.to_string(),
        user_query,
        ai_response,
        transaction_hash,
        timestamp: env.block.time,
        success,
    };
    
    // Store context
    deps.storage.set(
        &[CONTEXT_PREFIX, &state.context_id.to_be_bytes()].concat(),
        &to_binary(&context)?
    );
    
    // Update state
    deps.storage.set(STATE_KEY, &to_binary(&state)?);
    
    Ok(Response::new()
        .add_attribute("method", "store_context")
        .add_attribute("context_id", state.context_id.to_string())
        .add_attribute("user", info.sender.to_string()))
}

fn execute_stake(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    amount: Uint128,
) -> StdResult<Response> {
    let mut state: State = deps.storage.get(STATE_KEY)
        .ok_or_else(|| cosmwasm_std::StdError::NotFound { kind: "State".to_string() })?
        .try_into()?;
    
    // Check if user sent SEI tokens
    let sei_amount = info.funds.iter()
        .find(|c| c.denom == "usei")
        .map(|c| c.amount)
        .unwrap_or_default();
    
    if sei_amount != amount {
        return Err(cosmwasm_std::StdError::GenericErr {
            msg: "Incorrect amount sent".to_string(),
        });
    }
    
    state.stake_id += 1;
    
    let stake = Stake {
        id: state.stake_id,
        user: info.sender.to_string(),
        amount,
        start_time: env.block.time,
        end_time: env.block.time.plus_seconds(21 * 24 * 60 * 60), // 21 days
        active: true,
        rewards: Uint128::zero(),
    };
    
    // Store stake
    deps.storage.set(
        &[STAKE_PREFIX, &state.stake_id.to_be_bytes()].concat(),
        &to_binary(&stake)?
    );
    
    // Update state
    deps.storage.set(STATE_KEY, &to_binary(&state)?);
    
    Ok(Response::new()
        .add_attribute("method", "stake")
        .add_attribute("stake_id", state.stake_id.to_string())
        .add_attribute("amount", amount.to_string()))
}

// Query functions
fn query_context(deps: Deps, context_id: u64) -> StdResult<Context> {
    let data = deps.storage.get(&[CONTEXT_PREFIX, &context_id.to_be_bytes()].concat())
        .ok_or_else(|| cosmwasm_std::StdError::NotFound { kind: "Context".to_string() })?;
    data.try_into()
}

fn query_stake(deps: Deps, stake_id: u64) -> StdResult<Stake> {
    let data = deps.storage.get(&[STAKE_PREFIX, &stake_id.to_be_bytes()].concat())
        .ok_or_else(|| cosmwasm_std::StdError::NotFound { kind: "Stake".to_string() })?;
    data.try_into()
}

// Additional query functions would be implemented similarly...