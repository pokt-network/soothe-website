import AccountDetail from '@/components/Account/Detail'

export default function Page({params}: { params: { address: string } }) {
  return <AccountDetail address={params.address}/>
}
