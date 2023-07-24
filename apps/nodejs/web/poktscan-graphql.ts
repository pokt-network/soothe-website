import type {CodegenConfig} from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: {
    // todo: add from env
    'http://localhost:3003/poktscan/api/graphql': {
      headers: {
        // todo: add from env
        'Authorization': '22b59f87-3bcd-45d1-be7a-acf726d93c02',
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
