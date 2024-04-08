import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    const params = {}

    request.nextUrl.searchParams.forEach((value, key) => (params[key] = value))

    const res = await axios.get(process.env.ETHERSCAN_API_URL, {
      params: {
        ...params,
        apikey: process.env.ETHERSCAN_API_KEY,
      },
    })

    return NextResponse.json(res.data)
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: true, e })
  }
}
