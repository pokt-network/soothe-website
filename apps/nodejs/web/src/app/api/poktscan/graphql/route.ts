import { NextResponse } from 'next/server'
import axios from 'axios'

const POKTSCAN_API_KEY = process.env.POKTSCAN_API_KEY

export async function POST(request: Request) {
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  const body = await request.json()

  try {
    const res = await axios.post(process.env.POKTSCAN_GRAPHQL_API_URL, body, {
      headers: {
        Authorization: POKTSCAN_API_KEY,
      },
    })

    return NextResponse.json(res.data)
  } catch (e) {
    console.log(e)
    return NextResponse.json({ error: true })
  }
}
