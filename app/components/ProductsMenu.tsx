import Link from 'next/link'

export default function ProductsMenu() {
  return (
    <div className={"products-container"}>
      <button id={'products'} className={'simple-link'}>Products</button>
      <div className={'popover-container'}>
        <Link className={'simple-link'} href={'/#body'}>Soothe Vault</Link>
      </div>
    </div>
  )
}
