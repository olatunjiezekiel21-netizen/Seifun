import { SeiSwapTool } from '../langchain/symphony/swap'
import { seiAgentKit } from './SeiAgentKit'
import { SeiStakeTool } from '../langchain/silo/stake'

export const createSeiTools = () => {
  return [new SeiSwapTool(seiAgentKit), new SeiStakeTool()] as any[];
};
