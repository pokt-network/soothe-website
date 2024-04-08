import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const route = '/api/coinmarket'

export async function GET(request: NextRequest) {
  try {
    const path = request.url.substring(request.url.indexOf(route) + route.length)

    const res = await axios.get(process.env.COIN_MARKET_CAP_API_HOSTNAME + path, {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.COIN_MARKET_CAP_API_KEY,
      },
    })

    return NextResponse.json(res.data)
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: true, e })
  }
}
