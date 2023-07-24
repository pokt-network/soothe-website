import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

//todo: receive api key from env
const COIN_MARKET_API_KEY = 'd8221f1c-02c2-4016-849f-f3cd842d1e83'

const route = '/api/coinmarket'

export async function GET(request: NextRequest) {
  try {
    const path = request.url.substring(request.url.indexOf(route) + route.length)

    const res = await axios.get('https://pro-api.coinmarketcap.com' + path, {
      headers: {
        'X-CMC_PRO_API_KEY': COIN_MARKET_API_KEY,
      },
    })

    return NextResponse.json(res.data)
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: true, e })
  }
}
