use cosmwasm_std::{
    to_binary, Addr, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdResult, Uint128,
    Decimal, CosmosMsg, BankMsg, WasmMsg, coin, coins, SubMsg, WasmQuery, QueryRequest,
};
use cw_utils::must_pay;

use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, QueryMsg, ConfigResponse, OrderResponse, 
                OrdersResponse, LiquidityResponse, FeeInfoResponse, StatsResponse};
use crate::state::{Config, Order, TradeType, FeeInfo, Stats, CONFIG, ORDERS, USER_ORDERS, 
                  LIQUIDITY_BALANCES, FEE_RATES, STATS};

pub fn instantiate(
    deps: DepsMut,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    let config = Config {
        admin: deps.api.addr_validate(&msg.admin)?,
        fee_collector: deps.api.addr_validate(&msg.fee_collector)?,
        order_book: deps.api.addr_validate(&msg.order_book)?,
        amm_factory: deps.api.addr_validate(&msg.amm_factory)?,
    };

    CONFIG.save(deps.storage, &config)?;

    // Initialize stats
    let stats = Stats {
        total_trades: 0,
        total_volume: Uint128::zero(),
        last_trade_time: 0,
    };
    STATS.save(deps.storage, &stats)?;

    // Initialize default fee rates
    let default_fee = FeeInfo {
        rate: Decimal::from_ratio(25u128, 10000u128), // 0.25%
        collected: Uint128::zero(),
        is_active: true,
    };
    FEE_RATES.save(deps.storage, "usei", &default_fee)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("admin", config.admin))
}

pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::ExecuteMarketTrade {
            token_in,
            token_out,
            amount_in,
            min_amount_out,
            deadline,
        } => execute_market_trade(deps, env, info, token_in, token_out, amount_in, min_amount_out, deadline),
        
        ExecuteMsg::CreateLimitOrder {
            token_in,
            token_out,
            amount_in,
            price,
            deadline,
        } => create_limit_order(deps, env, info, token_in, token_out, amount_in, price, deadline),
        
        ExecuteMsg::CancelOrder { order_id } => cancel_order(deps, env, info, order_id),
        
        ExecuteMsg::AddLiquidity {
            token_a,
            token_b,
            amount_a,
            amount_b,
            min_liquidity,
        } => add_liquidity(deps, env, info, token_a, token_b, amount_a, amount_b, min_liquidity),
        
        ExecuteMsg::RemoveLiquidity {
            token_a,
            token_b,
            liquidity,
            min_amount_a,
            min_amount_b,
        } => remove_liquidity(deps, env, info, token_a, token_b, liquidity, min_amount_a, min_amount_b),
        
        ExecuteMsg::UpdateConfig {
            admin,
            fee_collector,
            order_book,
            amm_factory,
        } => update_config(deps, info, admin, fee_collector, order_book, amm_factory),
        
        ExecuteMsg::UpdateFeeRate { token, rate } => update_fee_rate(deps, info, token, rate),
        
        ExecuteMsg::EmergencyWithdraw { token, amount } => emergency_withdraw(deps, info, token, amount),
    }
}

pub fn query(deps: Deps, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Config {} => to_binary(&query_config(deps)?),
        QueryMsg::Order { order_id } => to_binary(&query_order(deps, order_id)?),
        QueryMsg::UserOrders { user } => to_binary(&query_user_orders(deps, user)?),
        QueryMsg::UserLiquidity { user, token } => to_binary(&query_user_liquidity(deps, user, token)?),
        QueryMsg::FeeInfo { token } => to_binary(&query_fee_info(deps, token)?),
        QueryMsg::Stats {} => to_binary(&query_stats(deps)?),
    }
}

fn execute_market_trade(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    token_in: String,
    token_out: String,
    amount_in: Uint128,
    min_amount_out: Uint128,
    deadline: u64,
) -> Result<Response, ContractError> {
    // Check deadline
    if env.block.time.seconds() > deadline {
        return Err(ContractError::TradeExpired {});
    }

    // Validate amounts
    if amount_in.is_zero() {
        return Err(ContractError::InvalidAmount {});
    }

    if token_in == token_out {
        return Err(ContractError::SameToken {});
    }

    // Calculate fee
    let fee_info = FEE_RATES.load(deps.storage, &token_in)
        .unwrap_or(FeeInfo {
            rate: Decimal::from_ratio(25u128, 10000u128), // 0.25% default
            collected: Uint128::zero(),
            is_active: true,
        });

    if !fee_info.is_active {
        return Err(ContractError::FeeCollectionInactive {});
    }

    let fee = amount_in * fee_info.rate;
    let amount_after_fee = amount_in - fee;

    // Execute trade (simplified - would integrate with actual CLOB/AMM)
    let amount_out = execute_trade(deps.as_ref(), &token_in, &token_out, amount_after_fee)?;

    if amount_out < min_amount_out {
        return Err(ContractError::InsufficientOutputAmount {});
    }

    // Collect fees
    if !fee.is_zero() {
        let config = CONFIG.load(deps.storage)?;
        
        // Update fee collection
        let mut updated_fee_info = fee_info;
        updated_fee_info.collected += fee;
        FEE_RATES.save(deps.storage, &token_in, &updated_fee_info)?;

        // Send fee to fee collector
        let fee_msg = if token_in == "usei" {
            BankMsg::Send {
                to_address: config.fee_collector.to_string(),
                amount: coins(fee.u128(), "usei"),
            }
        } else {
            // For other tokens, would need to send CW20 tokens
            return Err(ContractError::UnsupportedToken { token: token_in });
        };

        // Update stats
        let mut stats = STATS.load(deps.storage)?;
        stats.total_trades += 1;
        stats.total_volume += amount_in;
        stats.last_trade_time = env.block.time.seconds();
        STATS.save(deps.storage, &stats)?;

        // Create order ID
        let order_id = format!("{}-{}-{}-{}", info.sender, token_in, token_out, env.block.time.seconds());

        Ok(Response::new()
            .add_message(fee_msg)
            .add_attribute("method", "execute_market_trade")
            .add_attribute("user", info.sender)
            .add_attribute("token_in", token_in)
            .add_attribute("token_out", token_out)
            .add_attribute("amount_in", amount_in)
            .add_attribute("amount_out", amount_out)
            .add_attribute("fee", fee)
            .add_attribute("order_id", order_id))
    } else {
        Ok(Response::new()
            .add_attribute("method", "execute_market_trade")
            .add_attribute("user", info.sender)
            .add_attribute("token_in", token_in)
            .add_attribute("token_out", token_out)
            .add_attribute("amount_in", amount_in)
            .add_attribute("amount_out", amount_out))
    }
}

fn create_limit_order(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    token_in: String,
    token_out: String,
    amount_in: Uint128,
    price: Decimal,
    deadline: u64,
) -> Result<Response, ContractError> {
    // Check deadline
    if env.block.time.seconds() > deadline {
        return Err(ContractError::OrderExpired {});
    }

    // Validate inputs
    if amount_in.is_zero() || price.is_zero() {
        return Err(ContractError::InvalidAmount {});
    }

    if token_in == token_out {
        return Err(ContractError::SameToken {});
    }

    // Create order ID
    let order_id = format!("{}-{}-{}-{}-{}", info.sender, token_in, token_out, amount_in, env.block.time.seconds());

    // Create order
    let order = Order {
        user: info.sender.clone(),
        token_in: token_in.clone(),
        token_out: token_out.clone(),
        amount_in,
        min_amount_out: Uint128::zero(),
        price,
        trade_type: TradeType::Limit,
        deadline,
        is_active: true,
        order_id: order_id.clone(),
    };

    // Save order
    ORDERS.save(deps.storage, &order_id, &order)?;

    // Add to user orders
    let mut user_orders = USER_ORDERS.load(deps.storage, &info.sender).unwrap_or_default();
    user_orders.push(order_id.clone());
    USER_ORDERS.save(deps.storage, &info.sender, &user_orders)?;

    // Lock tokens (for native SEI)
    if token_in == "usei" {
        must_pay(&info, "usei")?;
    }

    Ok(Response::new()
        .add_attribute("method", "create_limit_order")
        .add_attribute("user", info.sender)
        .add_attribute("order_id", order_id)
        .add_attribute("token_in", token_in)
        .add_attribute("token_out", token_out)
        .add_attribute("amount_in", amount_in)
        .add_attribute("price", price))
}

fn cancel_order(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    order_id: String,
) -> Result<Response, ContractError> {
    let mut order = ORDERS.load(deps.storage, &order_id)
        .ok_or(ContractError::OrderNotFound {})?;

    if order.user != info.sender {
        return Err(ContractError::Unauthorized {});
    }

    if !order.is_active {
        return Err(ContractError::OrderNotActive {});
    }

    // Deactivate order
    order.is_active = false;
    ORDERS.save(deps.storage, &order_id, &order)?;

    // Return locked tokens
    if order.token_in == "usei" {
        let return_msg = BankMsg::Send {
            to_address: info.sender.to_string(),
            amount: coins(order.amount_in.u128(), "usei"),
        };

        Ok(Response::new()
            .add_message(return_msg)
            .add_attribute("method", "cancel_order")
            .add_attribute("user", info.sender)
            .add_attribute("order_id", order_id))
    } else {
        Ok(Response::new()
            .add_attribute("method", "cancel_order")
            .add_attribute("user", info.sender)
            .add_attribute("order_id", order_id))
    }
}

fn add_liquidity(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    token_a: String,
    token_b: String,
    amount_a: Uint128,
    amount_b: Uint128,
    min_liquidity: Uint128,
) -> Result<Response, ContractError> {
    if amount_a.is_zero() || amount_b.is_zero() {
        return Err(ContractError::InvalidAmount {});
    }

    if token_a == token_b {
        return Err(ContractError::SameToken {});
    }

    // Add liquidity to AMM (simplified)
    let liquidity = amount_a + amount_b; // Placeholder calculation

    if liquidity < min_liquidity {
        return Err(ContractError::InsufficientLiquidity {});
    }

    // Update user liquidity balance
    let current_balance_a = LIQUIDITY_BALANCES.load(deps.storage, (info.sender.clone(), token_a.clone())).unwrap_or_default();
    let current_balance_b = LIQUIDITY_BALANCES.load(deps.storage, (info.sender.clone(), token_b.clone())).unwrap_or_default();

    LIQUIDITY_BALANCES.save(deps.storage, (info.sender.clone(), token_a.clone()), &(current_balance_a + amount_a))?;
    LIQUIDITY_BALANCES.save(deps.storage, (info.sender.clone(), token_b.clone()), &(current_balance_b + amount_b))?;

    Ok(Response::new()
        .add_attribute("method", "add_liquidity")
        .add_attribute("user", info.sender)
        .add_attribute("token_a", token_a)
        .add_attribute("token_b", token_b)
        .add_attribute("amount_a", amount_a)
        .add_attribute("amount_b", amount_b)
        .add_attribute("liquidity", liquidity))
}

fn remove_liquidity(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    token_a: String,
    token_b: String,
    liquidity: Uint128,
    min_amount_a: Uint128,
    min_amount_b: Uint128,
) -> Result<Response, ContractError> {
    if liquidity.is_zero() {
        return Err(ContractError::InvalidAmount {});
    }

    // Remove liquidity from AMM (simplified)
    let amount_a = liquidity / Uint128::from(2u128); // Placeholder calculation
    let amount_b = liquidity / Uint128::from(2u128); // Placeholder calculation

    if amount_a < min_amount_a || amount_b < min_amount_b {
        return Err(ContractError::InsufficientOutputAmount {});
    }

    // Update user liquidity balance
    let current_balance_a = LIQUIDITY_BALANCES.load(deps.storage, (info.sender.clone(), token_a.clone())).unwrap_or_default();
    let current_balance_b = LIQUIDITY_BALANCES.load(deps.storage, (info.sender.clone(), token_b.clone())).unwrap_or_default();

    if current_balance_a < amount_a || current_balance_b < amount_b {
        return Err(ContractError::InsufficientBalance {});
    }

    LIQUIDITY_BALANCES.save(deps.storage, (info.sender.clone(), token_a.clone()), &(current_balance_a - amount_a))?;
    LIQUIDITY_BALANCES.save(deps.storage, (info.sender.clone(), token_b.clone()), &(current_balance_b - amount_b))?;

    // Return tokens to user
    let return_msg_a = BankMsg::Send {
        to_address: info.sender.to_string(),
        amount: coins(amount_a.u128(), &token_a),
    };

    let return_msg_b = BankMsg::Send {
        to_address: info.sender.to_string(),
        amount: coins(amount_b.u128(), &token_b),
    };

    Ok(Response::new()
        .add_message(return_msg_a)
        .add_message(return_msg_b)
        .add_attribute("method", "remove_liquidity")
        .add_attribute("user", info.sender)
        .add_attribute("token_a", token_a)
        .add_attribute("token_b", token_b)
        .add_attribute("amount_a", amount_a)
        .add_attribute("amount_b", amount_b))
}

fn update_config(
    deps: DepsMut,
    info: MessageInfo,
    admin: Option<String>,
    fee_collector: Option<String>,
    order_book: Option<String>,
    amm_factory: Option<String>,
) -> Result<Response, ContractError> {
    let mut config = CONFIG.load(deps.storage)?;

    // Check admin
    if info.sender != config.admin {
        return Err(ContractError::Unauthorized {});
    }

    // Update config
    if let Some(admin) = admin {
        config.admin = deps.api.addr_validate(&admin)?;
    }
    if let Some(fee_collector) = fee_collector {
        config.fee_collector = deps.api.addr_validate(&fee_collector)?;
    }
    if let Some(order_book) = order_book {
        config.order_book = deps.api.addr_validate(&order_book)?;
    }
    if let Some(amm_factory) = amm_factory {
        config.amm_factory = deps.api.addr_validate(&amm_factory)?;
    }

    CONFIG.save(deps.storage, &config)?;

    Ok(Response::new()
        .add_attribute("method", "update_config")
        .add_attribute("admin", config.admin))
}

fn update_fee_rate(
    deps: DepsMut,
    info: MessageInfo,
    token: String,
    rate: Decimal,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;

    // Check admin
    if info.sender != config.admin {
        return Err(ContractError::Unauthorized {});
    }

    // Validate rate (max 10%)
    if rate > Decimal::from_ratio(1000u128, 10000u128) {
        return Err(ContractError::InvalidFeeRate {});
    }

    // Update fee rate
    let mut fee_info = FEE_RATES.load(deps.storage, &token)
        .unwrap_or(FeeInfo {
            rate: Decimal::zero(),
            collected: Uint128::zero(),
            is_active: true,
        });

    fee_info.rate = rate;
    FEE_RATES.save(deps.storage, &token, &fee_info)?;

    Ok(Response::new()
        .add_attribute("method", "update_fee_rate")
        .add_attribute("token", token)
        .add_attribute("rate", rate))
}

fn emergency_withdraw(
    deps: DepsMut,
    info: MessageInfo,
    token: String,
    amount: Uint128,
) -> Result<Response, ContractError> {
    let config = CONFIG.load(deps.storage)?;

    // Check admin
    if info.sender != config.admin {
        return Err(ContractError::Unauthorized {});
    }

    if amount.is_zero() {
        return Err(ContractError::InvalidAmount {});
    }

    // Withdraw tokens
    let withdraw_msg = BankMsg::Send {
        to_address: config.admin.to_string(),
        amount: coins(amount.u128(), &token),
    };

    Ok(Response::new()
        .add_message(withdraw_msg)
        .add_attribute("method", "emergency_withdraw")
        .add_attribute("token", token)
        .add_attribute("amount", amount))
}

// Query functions
fn query_config(deps: Deps) -> StdResult<ConfigResponse> {
    let config = CONFIG.load(deps.storage)?;
    Ok(ConfigResponse {
        admin: config.admin,
        fee_collector: config.fee_collector,
        order_book: config.order_book,
        amm_factory: config.amm_factory,
    })
}

fn query_order(deps: Deps, order_id: String) -> StdResult<OrderResponse> {
    let order = ORDERS.may_load(deps.storage, &order_id)?;
    Ok(OrderResponse { order })
}

fn query_user_orders(deps: Deps, user: String) -> StdResult<OrdersResponse> {
    let user_addr = deps.api.addr_validate(&user)?;
    let orders = USER_ORDERS.load(deps.storage, user_addr).unwrap_or_default();
    Ok(OrdersResponse { orders })
}

fn query_user_liquidity(deps: Deps, user: String, token: String) -> StdResult<LiquidityResponse> {
    let user_addr = deps.api.addr_validate(&user)?;
    let balance = LIQUIDITY_BALANCES.load(deps.storage, (user_addr, token)).unwrap_or_default();
    Ok(LiquidityResponse { balance })
}

fn query_fee_info(deps: Deps, token: String) -> StdResult<FeeInfoResponse> {
    let fee_info = FEE_RATES.load(deps.storage, &token)
        .unwrap_or(FeeInfo {
            rate: Decimal::from_ratio(25u128, 10000u128), // 0.25% default
            collected: Uint128::zero(),
            is_active: true,
        });
    
    Ok(FeeInfoResponse {
        rate: fee_info.rate,
        collected: fee_info.collected,
        is_active: fee_info.is_active,
    })
}

fn query_stats(deps: Deps) -> StdResult<StatsResponse> {
    let stats = STATS.load(deps.storage)?;
    Ok(StatsResponse {
        total_trades: stats.total_trades,
        total_volume: stats.total_volume,
        last_trade_time: stats.last_trade_time,
    })
}

// Helper functions
fn execute_trade(
    deps: Deps,
    token_in: &str,
    token_out: &str,
    amount_in: Uint128,
) -> Result<Uint128, ContractError> {
    // Simplified trade execution
    // In production, this would integrate with actual CLOB/AMM contracts
    
    if token_in == "usei" && token_out == "usei" {
        return Ok(amount_in); // 1:1 for same token
    }
    
    // Placeholder: return 95% of input (5% slippage)
    Ok(amount_in * Decimal::from_ratio(95u128, 100u128))
}