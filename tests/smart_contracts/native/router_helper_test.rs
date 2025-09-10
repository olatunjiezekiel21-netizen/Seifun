#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    use cosmwasm_std::{coins, from_binary, Addr, Uint128, Decimal, Timestamp};
    use cw_multi_test::{App, Contract, ContractWrapper, Executor};

    fn contract() -> Box<dyn Contract<Empty>> {
        let contract = ContractWrapper::new(
            crate::contract::execute,
            crate::contract::instantiate,
            crate::contract::query,
        );
        Box::new(contract)
    }

    const NATIVE_DENOM: &str = "usei";

    fn mock_app() -> App {
        App::new(|router, _api, storage| {
            router
                .bank
                .init_balance(
                    storage,
                    &Addr::unchecked("user"),
                    coins(1000000, NATIVE_DENOM),
                )
                .unwrap();
        })
    }

    #[test]
    fn proper_initialization() {
        let mut app = mock_app();
        let code_id = app.store_code(contract());

        let msg = InstantiateMsg {
            admin: "admin".to_string(),
            fee_collector: "fee_collector".to_string(),
            order_book: "order_book".to_string(),
            amm_factory: "amm_factory".to_string(),
        };

        let contract_addr = app
            .instantiate_contract(
                code_id,
                Addr::unchecked("admin"),
                &msg,
                &[],
                "Router Helper",
                None,
            )
            .unwrap();

        let res: ConfigResponse = app
            .wrap()
            .query_wasm_smart(contract_addr, &QueryMsg::Config {})
            .unwrap();

        assert_eq!(res.admin, Addr::unchecked("admin"));
        assert_eq!(res.fee_collector, Addr::unchecked("fee_collector"));
        assert_eq!(res.order_book, Addr::unchecked("order_book"));
        assert_eq!(res.amm_factory, Addr::unchecked("amm_factory"));
    }

    #[test]
    fn execute_market_trade() {
        let mut app = mock_app();
        let code_id = app.store_code(contract());

        let msg = InstantiateMsg {
            admin: "admin".to_string(),
            fee_collector: "fee_collector".to_string(),
            order_book: "order_book".to_string(),
            amm_factory: "amm_factory".to_string(),
        };

        let contract_addr = app
            .instantiate_contract(
                code_id,
                Addr::unchecked("admin"),
                &msg,
                &[],
                "Router Helper",
                None,
            )
            .unwrap();

        let trade_msg = ExecuteMsg::ExecuteMarketTrade {
            token_in: NATIVE_DENOM.to_string(),
            token_out: "uusdc".to_string(),
            amount_in: Uint128::new(1000),
            min_amount_out: Uint128::new(950),
            deadline: 9999999999, // Far future
        };

        let info = mock_info("user", &coins(1000, NATIVE_DENOM));
        let res = app
            .execute_contract(
                Addr::unchecked("user"),
                contract_addr.clone(),
                &trade_msg,
                &coins(1000, NATIVE_DENOM),
            )
            .unwrap();

        // Check that fee was sent to fee collector
        assert_eq!(res.events.len(), 1);
        assert_eq!(res.events[0].ty, "wasm");

        // Check contract balance
        let balance = app.wrap().query_balance(&contract_addr, NATIVE_DENOM).unwrap();
        assert_eq!(balance.amount, Uint128::new(25)); // 0.25% fee
    }

    #[test]
    fn create_limit_order() {
        let mut app = mock_app();
        let code_id = app.store_code(contract());

        let msg = InstantiateMsg {
            admin: "admin".to_string(),
            fee_collector: "fee_collector".to_string(),
            order_book: "order_book".to_string(),
            amm_factory: "amm_factory".to_string(),
        };

        let contract_addr = app
            .instantiate_contract(
                code_id,
                Addr::unchecked("admin"),
                &msg,
                &[],
                "Router Helper",
                None,
            )
            .unwrap();

        let order_msg = ExecuteMsg::CreateLimitOrder {
            token_in: NATIVE_DENOM.to_string(),
            token_out: "uusdc".to_string(),
            amount_in: Uint128::new(1000),
            price: Decimal::from_ratio(1u128, 1u128),
            deadline: 9999999999,
        };

        let res = app
            .execute_contract(
                Addr::unchecked("user"),
                contract_addr.clone(),
                &order_msg,
                &coins(1000, NATIVE_DENOM),
            )
            .unwrap();

        assert_eq!(res.events.len(), 1);

        // Query user orders
        let orders_res: OrdersResponse = app
            .wrap()
            .query_wasm_smart(
                contract_addr,
                &QueryMsg::UserOrders {
                    user: "user".to_string(),
                },
            )
            .unwrap();

        assert_eq!(orders_res.orders.len(), 1);

        // Query order details
        let order_res: OrderResponse = app
            .wrap()
            .query_wasm_smart(
                contract_addr,
                &QueryMsg::Order {
                    order_id: orders_res.orders[0].clone(),
                },
            )
            .unwrap();

        assert!(order_res.order.is_some());
        let order = order_res.order.unwrap();
        assert_eq!(order.user, Addr::unchecked("user"));
        assert_eq!(order.token_in, NATIVE_DENOM);
        assert_eq!(order.token_out, "uusdc");
        assert_eq!(order.amount_in, Uint128::new(1000));
        assert!(order.is_active);
    }

    #[test]
    fn cancel_order() {
        let mut app = mock_app();
        let code_id = app.store_code(contract());

        let msg = InstantiateMsg {
            admin: "admin".to_string(),
            fee_collector: "fee_collector".to_string(),
            order_book: "order_book".to_string(),
            amm_factory: "amm_factory".to_string(),
        };

        let contract_addr = app
            .instantiate_contract(
                code_id,
                Addr::unchecked("admin"),
                &msg,
                &[],
                "Router Helper",
                None,
            )
            .unwrap();

        // Create order first
        let order_msg = ExecuteMsg::CreateLimitOrder {
            token_in: NATIVE_DENOM.to_string(),
            token_out: "uusdc".to_string(),
            amount_in: Uint128::new(1000),
            price: Decimal::from_ratio(1u128, 1u128),
            deadline: 9999999999,
        };

        app.execute_contract(
            Addr::unchecked("user"),
            contract_addr.clone(),
            &order_msg,
            &coins(1000, NATIVE_DENOM),
        )
        .unwrap();

        // Get order ID
        let orders_res: OrdersResponse = app
            .wrap()
            .query_wasm_smart(
                contract_addr.clone(),
                &QueryMsg::UserOrders {
                    user: "user".to_string(),
                },
            )
            .unwrap();

        let order_id = orders_res.orders[0].clone();

        // Cancel order
        let cancel_msg = ExecuteMsg::CancelOrder { order_id: order_id.clone() };

        let res = app
            .execute_contract(
                Addr::unchecked("user"),
                contract_addr.clone(),
                &cancel_msg,
                &[],
            )
            .unwrap();

        // Check that tokens were returned
        assert_eq!(res.events.len(), 1);

        // Check order is no longer active
        let order_res: OrderResponse = app
            .wrap()
            .query_wasm_smart(
                contract_addr,
                &QueryMsg::Order { order_id },
            )
            .unwrap();

        assert!(order_res.order.is_some());
        let order = order_res.order.unwrap();
        assert!(!order.is_active);
    }

    #[test]
    fn add_liquidity() {
        let mut app = mock_app();
        let code_id = app.store_code(contract());

        let msg = InstantiateMsg {
            admin: "admin".to_string(),
            fee_collector: "fee_collector".to_string(),
            order_book: "order_book".to_string(),
            amm_factory: "amm_factory".to_string(),
        };

        let contract_addr = app
            .instantiate_contract(
                code_id,
                Addr::unchecked("admin"),
                &msg,
                &[],
                "Router Helper",
                None,
            )
            .unwrap();

        let liquidity_msg = ExecuteMsg::AddLiquidity {
            token_a: NATIVE_DENOM.to_string(),
            token_b: "uusdc".to_string(),
            amount_a: Uint128::new(1000),
            amount_b: Uint128::new(1000),
            min_liquidity: Uint128::new(1800),
        };

        let res = app
            .execute_contract(
                Addr::unchecked("user"),
                contract_addr.clone(),
                &liquidity_msg,
                &coins(1000, NATIVE_DENOM),
            )
            .unwrap();

        assert_eq!(res.events.len(), 1);

        // Check user liquidity balance
        let liquidity_res: LiquidityResponse = app
            .wrap()
            .query_wasm_smart(
                contract_addr,
                &QueryMsg::UserLiquidity {
                    user: "user".to_string(),
                    token: NATIVE_DENOM.to_string(),
                },
            )
            .unwrap();

        assert_eq!(liquidity_res.balance, Uint128::new(1000));
    }

    #[test]
    fn remove_liquidity() {
        let mut app = mock_app();
        let code_id = app.store_code(contract());

        let msg = InstantiateMsg {
            admin: "admin".to_string(),
            fee_collector: "fee_collector".to_string(),
            order_book: "order_book".to_string(),
            amm_factory: "amm_factory".to_string(),
        };

        let contract_addr = app
            .instantiate_contract(
                code_id,
                Addr::unchecked("admin"),
                &msg,
                &[],
                "Router Helper",
                None,
            )
            .unwrap();

        // Add liquidity first
        let liquidity_msg = ExecuteMsg::AddLiquidity {
            token_a: NATIVE_DENOM.to_string(),
            token_b: "uusdc".to_string(),
            amount_a: Uint128::new(1000),
            amount_b: Uint128::new(1000),
            min_liquidity: Uint128::new(1800),
        };

        app.execute_contract(
            Addr::unchecked("user"),
            contract_addr.clone(),
            &liquidity_msg,
            &coins(1000, NATIVE_DENOM),
        )
        .unwrap();

        // Remove liquidity
        let remove_msg = ExecuteMsg::RemoveLiquidity {
            token_a: NATIVE_DENOM.to_string(),
            token_b: "uusdc".to_string(),
            liquidity: Uint128::new(2000),
            min_amount_a: Uint128::new(900),
            min_amount_b: Uint128::new(900),
        };

        let res = app
            .execute_contract(
                Addr::unchecked("user"),
                contract_addr.clone(),
                &remove_msg,
                &[],
            )
            .unwrap();

        // Check that tokens were returned
        assert_eq!(res.events.len(), 2); // Two token transfers

        // Check user liquidity balance is reduced
        let liquidity_res: LiquidityResponse = app
            .wrap()
            .query_wasm_smart(
                contract_addr,
                &QueryMsg::UserLiquidity {
                    user: "user".to_string(),
                    token: NATIVE_DENOM.to_string(),
                },
            )
            .unwrap();

        assert_eq!(liquidity_res.balance, Uint128::zero());
    }

    #[test]
    fn update_config() {
        let mut app = mock_app();
        let code_id = app.store_code(contract());

        let msg = InstantiateMsg {
            admin: "admin".to_string(),
            fee_collector: "fee_collector".to_string(),
            order_book: "order_book".to_string(),
            amm_factory: "amm_factory".to_string(),
        };

        let contract_addr = app
            .instantiate_contract(
                code_id,
                Addr::unchecked("admin"),
                &msg,
                &[],
                "Router Helper",
                None,
            )
            .unwrap();

        let update_msg = ExecuteMsg::UpdateConfig {
            admin: Some("new_admin".to_string()),
            fee_collector: Some("new_fee_collector".to_string()),
            order_book: None,
            amm_factory: None,
        };

        app.execute_contract(
            Addr::unchecked("admin"),
            contract_addr.clone(),
            &update_msg,
            &[],
        )
        .unwrap();

        let res: ConfigResponse = app
            .wrap()
            .query_wasm_smart(contract_addr, &QueryMsg::Config {})
            .unwrap();

        assert_eq!(res.admin, Addr::unchecked("new_admin"));
        assert_eq!(res.fee_collector, Addr::unchecked("new_fee_collector"));
        assert_eq!(res.order_book, Addr::unchecked("order_book"));
        assert_eq!(res.amm_factory, Addr::unchecked("amm_factory"));
    }

    #[test]
    fn update_fee_rate() {
        let mut app = mock_app();
        let code_id = app.store_code(contract());

        let msg = InstantiateMsg {
            admin: "admin".to_string(),
            fee_collector: "fee_collector".to_string(),
            order_book: "order_book".to_string(),
            amm_factory: "amm_factory".to_string(),
        };

        let contract_addr = app
            .instantiate_contract(
                code_id,
                Addr::unchecked("admin"),
                &msg,
                &[],
                "Router Helper",
                None,
            )
            .unwrap();

        let update_msg = ExecuteMsg::UpdateFeeRate {
            token: NATIVE_DENOM.to_string(),
            rate: Decimal::from_ratio(50u128, 10000u128), // 0.5%
        };

        app.execute_contract(
            Addr::unchecked("admin"),
            contract_addr.clone(),
            &update_msg,
            &[],
        )
        .unwrap();

        let res: FeeInfoResponse = app
            .wrap()
            .query_wasm_smart(
                contract_addr,
                &QueryMsg::FeeInfo {
                    token: NATIVE_DENOM.to_string(),
                },
            )
            .unwrap();

        assert_eq!(res.rate, Decimal::from_ratio(50u128, 10000u128));
    }

    #[test]
    fn emergency_withdraw() {
        let mut app = mock_app();
        let code_id = app.store_code(contract());

        let msg = InstantiateMsg {
            admin: "admin".to_string(),
            fee_collector: "fee_collector".to_string(),
            order_book: "order_book".to_string(),
            amm_factory: "amm_factory".to_string(),
        };

        let contract_addr = app
            .instantiate_contract(
                code_id,
                Addr::unchecked("admin"),
                &msg,
                &[],
                "Router Helper",
                None,
            )
            .unwrap();

        // Send some tokens to contract
        app.execute_contract(
            Addr::unchecked("user"),
            contract_addr.clone(),
            &ExecuteMsg::ExecuteMarketTrade {
                token_in: NATIVE_DENOM.to_string(),
                token_out: "uusdc".to_string(),
                amount_in: Uint128::new(1000),
                min_amount_out: Uint128::new(950),
                deadline: 9999999999,
            },
            &coins(1000, NATIVE_DENOM),
        )
        .unwrap();

        let balance_before = app.wrap().query_balance(&Addr::unchecked("admin"), NATIVE_DENOM).unwrap();

        // Emergency withdraw
        let withdraw_msg = ExecuteMsg::EmergencyWithdraw {
            token: NATIVE_DENOM.to_string(),
            amount: Uint128::new(25), // Fee amount
        };

        app.execute_contract(
            Addr::unchecked("admin"),
            contract_addr,
            &withdraw_msg,
            &[],
        )
        .unwrap();

        let balance_after = app.wrap().query_balance(&Addr::unchecked("admin"), NATIVE_DENOM).unwrap();
        assert_eq!(balance_after.amount, balance_before.amount + Uint128::new(25));
    }

    #[test]
    fn unauthorized_access() {
        let mut app = mock_app();
        let code_id = app.store_code(contract());

        let msg = InstantiateMsg {
            admin: "admin".to_string(),
            fee_collector: "fee_collector".to_string(),
            order_book: "order_book".to_string(),
            amm_factory: "amm_factory".to_string(),
        };

        let contract_addr = app
            .instantiate_contract(
                code_id,
                Addr::unchecked("admin"),
                &msg,
                &[],
                "Router Helper",
                None,
            )
            .unwrap();

        // Try to update config as non-admin
        let update_msg = ExecuteMsg::UpdateConfig {
            admin: Some("hacker".to_string()),
            fee_collector: None,
            order_book: None,
            amm_factory: None,
        };

        let err = app
            .execute_contract(
                Addr::unchecked("user"),
                contract_addr,
                &update_msg,
                &[],
            )
            .unwrap_err();

        assert!(err.to_string().contains("Unauthorized"));
    }

    #[test]
    fn expired_trade() {
        let mut app = mock_app();
        let code_id = app.store_code(contract());

        let msg = InstantiateMsg {
            admin: "admin".to_string(),
            fee_collector: "fee_collector".to_string(),
            order_book: "order_book".to_string(),
            amm_factory: "amm_factory".to_string(),
        };

        let contract_addr = app
            .instantiate_contract(
                code_id,
                Addr::unchecked("admin"),
                &msg,
                &[],
                "Router Helper",
                None,
            )
            .unwrap();

        // Try to execute trade with past deadline
        let trade_msg = ExecuteMsg::ExecuteMarketTrade {
            token_in: NATIVE_DENOM.to_string(),
            token_out: "uusdc".to_string(),
            amount_in: Uint128::new(1000),
            min_amount_out: Uint128::new(950),
            deadline: 1, // Past deadline
        };

        let err = app
            .execute_contract(
                Addr::unchecked("user"),
                contract_addr,
                &trade_msg,
                &coins(1000, NATIVE_DENOM),
            )
            .unwrap_err();

        assert!(err.to_string().contains("Trade expired"));
    }

    #[test]
    fn query_stats() {
        let mut app = mock_app();
        let code_id = app.store_code(contract());

        let msg = InstantiateMsg {
            admin: "admin".to_string(),
            fee_collector: "fee_collector".to_string(),
            order_book: "order_book".to_string(),
            amm_factory: "amm_factory".to_string(),
        };

        let contract_addr = app
            .instantiate_contract(
                code_id,
                Addr::unchecked("admin"),
                &msg,
                &[],
                "Router Helper",
                None,
            )
            .unwrap();

        let res: StatsResponse = app
            .wrap()
            .query_wasm_smart(contract_addr, &QueryMsg::Stats {})
            .unwrap();

        assert_eq!(res.total_trades, 0);
        assert_eq!(res.total_volume, Uint128::zero());
        assert_eq!(res.last_trade_time, 0);
    }
}