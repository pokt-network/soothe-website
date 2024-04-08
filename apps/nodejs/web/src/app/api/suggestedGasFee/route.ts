import type { SuggestedGasFee } from '@/types'
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import Eth from 'web3-eth'
import { fromWei, toWei } from 'web3-utils'

const API_KEY = process.env.INFURA_API_KEY
const API_KEY_SECRET = process.env.INFURA_API_SECRET_KEY

const Auth = Buffer.from(`${API_KEY}:${API_KEY_SECRET}`).toString('base64')
const ethClient = new Eth(process.env.ETH_MAINNET_RPC_URL)

const calculateAmountForSpeed = (
  baseFee: string,
  estimatedGas: number,
  suggestedMaxPriorityFeePerGas: string
) => {
  const baseFeeAsBigInt = Number(baseFee)
  const maxPriorityFeePerGasAsBigInt = Number(suggestedMaxPriorityFeePerGas)
  const feeInGwei = (
    (baseFeeAsBigInt + maxPriorityFeePerGasAsBigInt) *
    Number(estimatedGas)
  ).toFixed(6)
  const feeInWei = toWei(feeInGwei, 'gwei')
  return Number(fromWei(feeInWei, 'ether')).toFixed(7)
}

export async function POST(request: NextRequest) {
  try {
    // todo: add validate
    const { chainId, transaction } = await request.json()

    const [res, estimatedGas] = await Promise.all([
      axios.get<unknown, { data: SuggestedGasFee }>(
        process.env.SUGGESTED_GAS_FEE_API_URL.replace(':chainId', chainId),
        {
          headers: {
            Authorization: `Basic ${Auth}`,
          },
        }
      ),
      ethClient.estimateGas(transaction).then((result) => Number(result) * 1.5),
    ])

    const suggestions = res.data

    suggestions.low.amount = calculateAmountForSpeed(
      suggestions.estimatedBaseFee,
      estimatedGas,
      suggestions.low.suggestedMaxPriorityFeePerGas
    )

    suggestions.medium.amount = calculateAmountForSpeed(
      suggestions.estimatedBaseFee,
      estimatedGas,
      suggestions.medium.suggestedMaxPriorityFeePerGas
    )

    suggestions.high.amount = calculateAmountForSpeed(
      suggestions.estimatedBaseFee,
      estimatedGas,
      suggestions.high.suggestedMaxPriorityFeePerGas
    )

    return NextResponse.json(suggestions)
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: true, e })
  }
}
