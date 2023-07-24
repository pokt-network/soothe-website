import {ApolloClient, InMemoryCache, ApolloProvider, gql, HttpLink} from '@apollo/client'

const customFetch = (uri: string, options: RequestInit) => {
  const {operationName} = JSON.parse(options.body as string)
  return fetch(`${uri}?opname=${operationName}`, options)
}

const poktscanClient = new ApolloClient({
  link: new HttpLink({
    uri: '/api/poktscan/graphql',
    fetch: customFetch,
  }),
  cache: new InMemoryCache(),
})

export default poktscanClient
