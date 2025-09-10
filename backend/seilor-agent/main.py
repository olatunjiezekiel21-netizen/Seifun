"""
Seilor-0: AI Trading Agent for Seifun
Handles both Sei EVM and Native chain trading operations
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Dict, List, Optional, Union

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from app.core.config import settings
from app.core.database import init_db
from app.core.redis import init_redis
from app.services.agent import SeilorAgent
from app.services.market_analyzer import MarketAnalyzer
from app.services.risk_manager import RiskManager
from app.services.execution_engine import ExecutionEngine
from app.models.schemas import (
    TradingSignal, 
    TradeExecution, 
    MarketData, 
    RiskAssessment,
    AgentStatus,
    ChainType
)
from app.api.routes import router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Global services
seilor_agent: Optional[SeilorAgent] = None
market_analyzer: Optional[MarketAnalyzer] = None
risk_manager: Optional[RiskManager] = None
execution_engine: Optional[ExecutionEngine] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global seilor_agent, market_analyzer, risk_manager, execution_engine
    
    logger.info("Starting Seilor-0 Agent...")
    
    # Initialize database
    await init_db()
    
    # Initialize Redis
    await init_redis()
    
    # Initialize services
    market_analyzer = MarketAnalyzer()
    risk_manager = RiskManager()
    execution_engine = ExecutionEngine()
    seilor_agent = SeilorAgent(
        market_analyzer=market_analyzer,
        risk_manager=risk_manager,
        execution_engine=execution_engine
    )
    
    # Start background tasks
    asyncio.create_task(seilor_agent.start_monitoring())
    asyncio.create_task(market_analyzer.start_data_collection())
    asyncio.create_task(risk_manager.start_risk_monitoring())
    
    logger.info("Seilor-0 Agent started successfully")
    
    yield
    
    # Cleanup
    logger.info("Shutting down Seilor-0 Agent...")
    if seilor_agent:
        await seilor_agent.stop()
    if market_analyzer:
        await market_analyzer.stop()
    if risk_manager:
        await risk_manager.stop()
    logger.info("Seilor-0 Agent stopped")

# Create FastAPI app
app = FastAPI(
    title="Seilor-0 AI Trading Agent",
    description="Automated trading agent for Sei EVM and Native chains",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api/v1")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "agent": "Seilor-0",
        "version": "1.0.0",
        "chains": ["sei-evm", "sei-native"]
    }

# Agent status endpoint
@app.get("/status")
async def get_agent_status():
    """Get current agent status"""
    if not seilor_agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    status = await seilor_agent.get_status()
    return status

# Trading signal endpoint
@app.post("/signals")
async def generate_trading_signal(
    market_data: MarketData,
    background_tasks: BackgroundTasks
):
    """Generate trading signal based on market data"""
    if not seilor_agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        signal = await seilor_agent.generate_signal(market_data)
        
        # Process signal in background
        background_tasks.add_task(seilor_agent.process_signal, signal)
        
        return signal
    except Exception as e:
        logger.error(f"Error generating trading signal: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Execute trade endpoint
@app.post("/execute")
async def execute_trade(
    trade: TradeExecution,
    background_tasks: BackgroundTasks
):
    """Execute a trade on the specified chain"""
    if not seilor_agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        result = await seilor_agent.execute_trade(trade)
        
        # Log trade execution
        background_tasks.add_task(seilor_agent.log_trade, trade, result)
        
        return result
    except Exception as e:
        logger.error(f"Error executing trade: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Risk assessment endpoint
@app.post("/risk")
async def assess_risk(
    trade: TradeExecution
):
    """Assess risk for a potential trade"""
    if not risk_manager:
        raise HTTPException(status_code=503, detail="Risk manager not initialized")
    
    try:
        assessment = await risk_manager.assess_trade_risk(trade)
        return assessment
    except Exception as e:
        logger.error(f"Error assessing risk: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Market analysis endpoint
@app.post("/analyze")
async def analyze_market(
    market_data: MarketData
):
    """Analyze market conditions"""
    if not market_analyzer:
        raise HTTPException(status_code=503, detail="Market analyzer not initialized")
    
    try:
        analysis = await market_analyzer.analyze(market_data)
        return analysis
    except Exception as e:
        logger.error(f"Error analyzing market: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Cross-chain arbitrage endpoint
@app.get("/arbitrage")
async def get_arbitrage_opportunities():
    """Get current arbitrage opportunities between EVM and Native chains"""
    if not seilor_agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        opportunities = await seilor_agent.get_arbitrage_opportunities()
        return opportunities
    except Exception as e:
        logger.error(f"Error getting arbitrage opportunities: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )