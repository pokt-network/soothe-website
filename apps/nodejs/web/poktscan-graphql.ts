import type { CodegenConfig } from '@graphql-codegen/cli'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.join('..', '..', '..', '.env') })

const config: CodegenConfig = {
  overwrite: true,
  schema: {
    [process.env.POKTSCAN_GRAPHQL_API_URL]: {
      headers: {
        Authorization: process.env.POKTSCAN_API_KEY,
      },
    },
  },
  documents: 'src/datasource/chains/pokt/document.ts',
  generates: {
    'src/gql/': {
      preset: 'client',
    },
  },
}

export default config
