import type { Handler } from '@netlify/functions'

// Basic staking quote (static APY or simple heuristic)
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const apy = 12.5 // Example APY
    const tips = [
      'Consider diversifying validators to reduce risk',
      'Reinvest rewards to compound returns',
      'Monitor validator uptime and commission'
    ]
    return { statusCode: 200, body: JSON.stringify({ apy, tips }) }
  } catch (err: any) {
    return { statusCode: 500, body: `Error: ${err.message}` }
  }
}

