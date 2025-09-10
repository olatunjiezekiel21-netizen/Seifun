"""
Seilor-0 AI Trading Agent
Main agent class that orchestrates trading decisions across both Sei EVM and Native chains
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Union
from dataclasses import dataclass
from enum import Enum

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import xgboost as xgb

from app.models.schemas import (
    TradingSignal, 
    TradeExecution, 
    MarketData, 
    RiskAssessment,
    AgentStatus,
    ChainType,
    ArbitrageOpportunity
)
from app.services.market_analyzer import MarketAnalyzer
from app.services.risk_manager import RiskManager
from app.services.execution_engine import ExecutionEngine
from app.core.redis import redis_client
from app.core.database import get_db

logger = logging.getLogger(__name__)

class TradingStrategy(Enum):
    MOMENTUM = "momentum"
    MEAN_REVERSION = "mean_reversion"
    ARBITRAGE = "arbitrage"
    MARKET_MAKING = "market_making"
    TREND_FOLLOWING = "trend_following"

@dataclass
class AgentConfig:
    """Agent configuration parameters"""
    max_position_size: float = 0.1  # 10% of portfolio
    risk_tolerance: float = 0.02    # 2% max risk per trade
    min_profit_threshold: float = 0.005  # 0.5% minimum profit
    max_drawdown: float = 0.05      # 5% maximum drawdown
    rebalance_frequency: int = 300   # 5 minutes
    arbitrage_threshold: float = 0.01  # 1% minimum arbitrage opportunity

class SeilorAgent:
    """
    Seilor-0 AI Trading Agent
    
    This agent handles automated trading across both Sei EVM and Native chains,
    utilizing machine learning models for signal generation and risk management.
    """
    
    def __init__(
        self,
        market_analyzer: MarketAnalyzer,
        risk_manager: RiskManager,
        execution_engine: ExecutionEngine
    ):
        self.market_analyzer = market_analyzer
        self.risk_manager = risk_manager
        self.execution_engine = execution_engine
        
        self.config = AgentConfig()
        self.is_running = False
        self.positions: Dict[str, Dict] = {}
        self.performance_metrics = {
            "total_trades": 0,
            "winning_trades": 0,
            "losing_trades": 0,
            "total_pnl": 0.0,
            "max_drawdown": 0.0,
            "sharpe_ratio": 0.0
        }
        
        # ML Models
        self.price_predictor = None
        self.signal_classifier = None
        self.scaler = StandardScaler()
        
        # Initialize models
        self._initialize_models()
    
    async def start_monitoring(self):
        """Start the agent monitoring loop"""
        self.is_running = True
        logger.info("Starting Seilor-0 monitoring loop...")
        
        while self.is_running:
            try:
                await self._monitoring_cycle()
                await asyncio.sleep(1)  # 1 second cycle
            except Exception as e:
                logger.error(f"Error in monitoring cycle: {e}")
                await asyncio.sleep(5)  # Wait before retrying
    
    async def stop(self):
        """Stop the agent"""
        self.is_running = False
        logger.info("Seilor-0 agent stopped")
    
    async def _monitoring_cycle(self):
        """Main monitoring cycle"""
        # Get latest market data
        market_data = await self._get_latest_market_data()
        
        # Generate trading signals
        signals = await self._generate_signals(market_data)
        
        # Process signals
        for signal in signals:
            await self._process_signal(signal)
        
        # Check for arbitrage opportunities
        await self._check_arbitrage_opportunities()
        
        # Update performance metrics
        await self._update_performance_metrics()
    
    async def _get_latest_market_data(self) -> Dict[str, MarketData]:
        """Get latest market data from both chains"""
        try:
            # Get EVM market data
            evm_data = await self.market_analyzer.get_chain_data(ChainType.EVM)
            
            # Get Native market data
            native_data = await self.market_analyzer.get_chain_data(ChainType.NATIVE)
            
            return {
                "evm": evm_data,
                "native": native_data
            }
        except Exception as e:
            logger.error(f"Error getting market data: {e}")
            return {}
    
    async def _generate_signals(self, market_data: Dict[str, MarketData]) -> List[TradingSignal]:
        """Generate trading signals based on market data"""
        signals = []
        
        for chain_type, data in market_data.items():
            try:
                # Technical analysis signals
                tech_signals = await self._generate_technical_signals(data, chain_type)
                signals.extend(tech_signals)
                
                # ML-based signals
                ml_signals = await self._generate_ml_signals(data, chain_type)
                signals.extend(ml_signals)
                
            except Exception as e:
                logger.error(f"Error generating signals for {chain_type}: {e}")
        
        return signals
    
    async def _generate_technical_signals(
        self, 
        market_data: MarketData, 
        chain_type: str
    ) -> List[TradingSignal]:
        """Generate technical analysis signals"""
        signals = []
        
        # RSI signals
        if market_data.rsi < 30:
            signals.append(TradingSignal(
                token=market_data.token,
                chain_type=ChainType(chain_type),
                signal_type="buy",
                confidence=0.8,
                reason="RSI oversold",
                price_target=market_data.price * 1.05,
                stop_loss=market_data.price * 0.95
            ))
        elif market_data.rsi > 70:
            signals.append(TradingSignal(
                token=market_data.token,
                chain_type=ChainType(chain_type),
                signal_type="sell",
                confidence=0.8,
                reason="RSI overbought",
                price_target=market_data.price * 0.95,
                stop_loss=market_data.price * 1.05
            ))
        
        # MACD signals
        if market_data.macd > market_data.macd_signal:
            signals.append(TradingSignal(
                token=market_data.token,
                chain_type=ChainType(chain_type),
                signal_type="buy",
                confidence=0.7,
                reason="MACD bullish crossover",
                price_target=market_data.price * 1.03,
                stop_loss=market_data.price * 0.97
            ))
        
        # Volume signals
        if market_data.volume_24h > market_data.avg_volume * 1.5:
            signals.append(TradingSignal(
                token=market_data.token,
                chain_type=ChainType(chain_type),
                signal_type="buy",
                confidence=0.6,
                reason="High volume breakout",
                price_target=market_data.price * 1.02,
                stop_loss=market_data.price * 0.98
            ))
        
        return signals
    
    async def _generate_ml_signals(
        self, 
        market_data: MarketData, 
        chain_type: str
    ) -> List[TradingSignal]:
        """Generate ML-based trading signals"""
        signals = []
        
        if not self.price_predictor:
            return signals
        
        try:
            # Prepare features
            features = self._prepare_features(market_data)
            
            # Predict price movement
            price_prediction = self.price_predictor.predict([features])[0]
            
            # Generate signal based on prediction
            if price_prediction > 0.02:  # 2% predicted increase
                signals.append(TradingSignal(
                    token=market_data.token,
                    chain_type=ChainType(chain_type),
                    signal_type="buy",
                    confidence=min(0.9, abs(price_prediction) * 10),
                    reason=f"ML prediction: {price_prediction:.2%} price increase",
                    price_target=market_data.price * (1 + price_prediction),
                    stop_loss=market_data.price * (1 - price_prediction * 0.5)
                ))
            elif price_prediction < -0.02:  # 2% predicted decrease
                signals.append(TradingSignal(
                    token=market_data.token,
                    chain_type=ChainType(chain_type),
                    signal_type="sell",
                    confidence=min(0.9, abs(price_prediction) * 10),
                    reason=f"ML prediction: {price_prediction:.2%} price decrease",
                    price_target=market_data.price * (1 + price_prediction),
                    stop_loss=market_data.price * (1 - price_prediction * 0.5)
                ))
        
        except Exception as e:
            logger.error(f"Error generating ML signals: {e}")
        
        return signals
    
    def _prepare_features(self, market_data: MarketData) -> List[float]:
        """Prepare features for ML model"""
        return [
            market_data.price,
            market_data.volume_24h,
            market_data.rsi,
            market_data.macd,
            market_data.macd_signal,
            market_data.bollinger_upper,
            market_data.bollinger_lower,
            market_data.sma_20,
            market_data.sma_50,
            market_data.price_change_24h,
            market_data.volume_change_24h
        ]
    
    async def _process_signal(self, signal: TradingSignal):
        """Process a trading signal"""
        try:
            # Risk assessment
            risk_assessment = await self.risk_manager.assess_signal_risk(signal)
            
            if risk_assessment.risk_level == "high":
                logger.warning(f"High risk signal rejected: {signal.reason}")
                return
            
            # Check position limits
            if not await self._check_position_limits(signal):
                logger.warning(f"Position limit exceeded for {signal.token}")
                return
            
            # Execute trade
            trade = TradeExecution(
                token=signal.token,
                chain_type=signal.chain_type,
                side=signal.signal_type,
                amount=self._calculate_position_size(signal, risk_assessment),
                price=signal.price_target,
                stop_loss=signal.stop_loss,
                confidence=signal.confidence
            )
            
            result = await self.execute_trade(trade)
            
            if result["success"]:
                logger.info(f"Trade executed successfully: {signal.token} {signal.signal_type}")
                self.performance_metrics["total_trades"] += 1
            else:
                logger.error(f"Trade execution failed: {result['error']}")
        
        except Exception as e:
            logger.error(f"Error processing signal: {e}")
    
    async def _check_arbitrage_opportunities(self):
        """Check for arbitrage opportunities between chains"""
        try:
            # Get prices from both chains
            evm_prices = await self.market_analyzer.get_chain_prices(ChainType.EVM)
            native_prices = await self.market_analyzer.get_chain_prices(ChainType.NATIVE)
            
            opportunities = []
            
            for token in evm_prices:
                if token in native_prices:
                    evm_price = evm_prices[token]
                    native_price = native_prices[token]
                    
                    # Calculate price difference
                    price_diff = abs(evm_price - native_price) / min(evm_price, native_price)
                    
                    if price_diff > self.config.arbitrage_threshold:
                        opportunity = ArbitrageOpportunity(
                            token=token,
                            evm_price=evm_price,
                            native_price=native_price,
                            price_difference=price_diff,
                            direction="buy_native_sell_evm" if native_price < evm_price else "buy_evm_sell_native",
                            potential_profit=price_diff * min(evm_price, native_price),
                            timestamp=datetime.now()
                        )
                        opportunities.append(opportunity)
            
            # Store opportunities in Redis
            if opportunities:
                await redis_client.set(
                    "arbitrage_opportunities",
                    [opp.dict() for opp in opportunities],
                    ex=60  # 1 minute expiry
                )
        
        except Exception as e:
            logger.error(f"Error checking arbitrage opportunities: {e}")
    
    async def _check_position_limits(self, signal: TradingSignal) -> bool:
        """Check if position limits are respected"""
        current_position = self.positions.get(signal.token, {}).get("size", 0)
        proposed_size = self._calculate_position_size(signal, None)
        
        # Check maximum position size
        if abs(current_position + proposed_size) > self.config.max_position_size:
            return False
        
        return True
    
    def _calculate_position_size(
        self, 
        signal: TradingSignal, 
        risk_assessment: Optional[RiskAssessment]
    ) -> float:
        """Calculate position size based on signal and risk"""
        base_size = self.config.max_position_size * signal.confidence
        
        if risk_assessment:
            # Adjust size based on risk
            risk_multiplier = 1.0 - (risk_assessment.risk_score / 100.0)
            base_size *= risk_multiplier
        
        return base_size
    
    async def _update_performance_metrics(self):
        """Update performance metrics"""
        try:
            # Calculate current PnL
            current_pnl = sum(pos.get("pnl", 0) for pos in self.positions.values())
            
            # Update metrics
            self.performance_metrics["total_pnl"] = current_pnl
            
            # Calculate Sharpe ratio (simplified)
            if self.performance_metrics["total_trades"] > 0:
                win_rate = self.performance_metrics["winning_trades"] / self.performance_metrics["total_trades"]
                self.performance_metrics["sharpe_ratio"] = win_rate * 2 - 1  # Simplified calculation
            
            # Store metrics in Redis
            await redis_client.set(
                "agent_metrics",
                self.performance_metrics,
                ex=300  # 5 minutes expiry
            )
        
        except Exception as e:
            logger.error(f"Error updating performance metrics: {e}")
    
    def _initialize_models(self):
        """Initialize ML models"""
        try:
            # Initialize price predictor (XGBoost)
            self.price_predictor = xgb.XGBRegressor(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            )
            
            # Initialize signal classifier (Random Forest)
            self.signal_classifier = RandomForestRegressor(
                n_estimators=50,
                max_depth=5,
                random_state=42
            )
            
            logger.info("ML models initialized successfully")
        
        except Exception as e:
            logger.error(f"Error initializing ML models: {e}")
    
    # Public API methods
    
    async def generate_signal(self, market_data: MarketData) -> TradingSignal:
        """Generate a trading signal for the given market data"""
        signals = await self._generate_technical_signals(market_data, market_data.chain_type.value)
        
        if signals:
            # Return the highest confidence signal
            return max(signals, key=lambda s: s.confidence)
        
        # Return neutral signal if no signals generated
        return TradingSignal(
            token=market_data.token,
            chain_type=market_data.chain_type,
            signal_type="hold",
            confidence=0.5,
            reason="No clear signal",
            price_target=market_data.price,
            stop_loss=market_data.price * 0.95
        )
    
    async def execute_trade(self, trade: TradeExecution) -> Dict:
        """Execute a trade on the specified chain"""
        try:
            # Risk assessment
            risk_assessment = await self.risk_manager.assess_trade_risk(trade)
            
            if risk_assessment.risk_level == "high":
                return {
                    "success": False,
                    "error": "High risk trade rejected",
                    "risk_score": risk_assessment.risk_score
                }
            
            # Execute trade
            result = await self.execution_engine.execute_trade(trade)
            
            if result["success"]:
                # Update position tracking
                self._update_position(trade, result)
                
                # Log trade
                await self._log_trade(trade, result)
            
            return result
        
        except Exception as e:
            logger.error(f"Error executing trade: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _update_position(self, trade: TradeExecution, result: Dict):
        """Update position tracking"""
        token = trade.token
        if token not in self.positions:
            self.positions[token] = {
                "size": 0,
                "avg_price": 0,
                "pnl": 0,
                "trades": []
            }
        
        position = self.positions[token]
        
        # Update position size
        if trade.side == "buy":
            new_size = position["size"] + trade.amount
            if new_size != 0:
                position["avg_price"] = (
                    (position["avg_price"] * position["size"] + trade.price * trade.amount) / new_size
                )
            position["size"] = new_size
        else:  # sell
            position["size"] -= trade.amount
        
        # Update PnL
        if position["size"] != 0:
            position["pnl"] = (trade.price - position["avg_price"]) * position["size"]
        
        # Add trade to history
        position["trades"].append({
            "timestamp": datetime.now(),
            "side": trade.side,
            "amount": trade.amount,
            "price": trade.price,
            "result": result
        })
    
    async def _log_trade(self, trade: TradeExecution, result: Dict):
        """Log trade execution"""
        try:
            trade_log = {
                "timestamp": datetime.now(),
                "token": trade.token,
                "chain_type": trade.chain_type.value,
                "side": trade.side,
                "amount": trade.amount,
                "price": trade.price,
                "confidence": trade.confidence,
                "result": result
            }
            
            # Store in database
            # await self.db.store_trade_log(trade_log)
            
            # Store in Redis for real-time access
            await redis_client.lpush("trade_logs", trade_log)
            await redis_client.ltrim("trade_logs", 0, 999)  # Keep last 1000 trades
        
        except Exception as e:
            logger.error(f"Error logging trade: {e}")
    
    async def get_status(self) -> AgentStatus:
        """Get current agent status"""
        return AgentStatus(
            is_running=self.is_running,
            total_trades=self.performance_metrics["total_trades"],
            total_pnl=self.performance_metrics["total_pnl"],
            max_drawdown=self.performance_metrics["max_drawdown"],
            sharpe_ratio=self.performance_metrics["sharpe_ratio"],
            active_positions=len([p for p in self.positions.values() if p["size"] != 0]),
            last_update=datetime.now()
        )
    
    async def get_arbitrage_opportunities(self) -> List[ArbitrageOpportunity]:
        """Get current arbitrage opportunities"""
        try:
            opportunities_data = await redis_client.get("arbitrage_opportunities")
            if opportunities_data:
                return [ArbitrageOpportunity(**opp) for opp in opportunities_data]
            return []
        except Exception as e:
            logger.error(f"Error getting arbitrage opportunities: {e}")
            return []
    
    async def process_signal(self, signal: TradingSignal):
        """Process a trading signal (public method)"""
        await self._process_signal(signal)
    
    async def log_trade(self, trade: TradeExecution, result: Dict):
        """Log a trade (public method)"""
        await self._log_trade(trade, result)