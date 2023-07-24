import {NextResponse} from 'next/server'
import axios from 'axios'

//todo: receive api key from env
const POKTSCAN_API_KEY = '22b59f87-3bcd-45d1-be7a-acf726d93c02'

export async function POST(request: Request) {
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })

  const body = await request.json()

  try {
    const res = await axios.post('http://localhost:3003/poktscan/api/graphql', body, {
      headers: {
        'Authorization': POKTSCAN_API_KEY,
      },
    })

    return NextResponse.json(res.data)
  } catch (e) {
    console.log(e)
    return NextResponse.json({error: true})

  }
}
