import { cambrianSeiAgent } from '../../services/CambrianSeiAgent'

export type StakeParams = {
  amount: string
  validator?: `0x${string}`
  action?: 'delegate' | 'undelegate' | 'redelegate' | 'claim'
  newValidator?: `0x${string}`
}

export class SeiStakeTool {
  name = 'sei_stake_tool'
  description = 'Stake, undelegate, redelegate, or claim rewards on Sei via precompile'

  async call(input: StakeParams): Promise<any> {
    const { amount, validator, action, newValidator } = input
    if (!amount) throw new Error('Missing amount')
    const res = await cambrianSeiAgent.stakeTokens({ amount, action: action || 'delegate', validator: validator as any, newValidator: newValidator as any })
    return { message: res }
  }
}
