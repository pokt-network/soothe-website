import {NextRequest, NextResponse} from 'next/server'
import axios from 'axios'

//todo: receive api key from env
const ETHERSCAN_API_KEY = 'Q55E56Q44X5AV9TW5MGPCAKDTAU2MCRPSP'

export async function GET(request: NextRequest) {
  try {
    const params = {}

    request.nextUrl.searchParams.forEach((value, key) => params[key] = value)

    const res = await axios.get('https://api.etherscan.io/api', {
      params: {
        ...params,
        apikey: ETHERSCAN_API_KEY,
      },
    })

    return NextResponse.json(res.data)
  } catch (e) {
    console.log(e)
    return NextResponse.json({error: true, e})

  }
}
