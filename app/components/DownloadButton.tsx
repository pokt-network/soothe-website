import { headers } from 'next/headers'
import Image from 'next/image'
import ChromeLogo from '../assets/chrome.svg'
import BraveLogo from '../assets/brave.svg'

export default function DownloadButton() {
  const userAgent = headers().get('user-agent')

  const isChromeOrBrave = userAgent && /Chrome/.test(userAgent)

  if (isChromeOrBrave) {
    return (
      <a className={"primary-btn bigger-btn"} style={{ marginTop: 10 }} href={'https://chrome.google.com/webstore/detail/soothe-vault-beta/mcgbfmioikpilhncbhdkjbjinfhgplpa'} target={'_blank'}>
        Download Soothe Vault
      </a>
    );
  }

  return (
    <div className={"unsupported-browser"}>
      <p className={"unsupported-title"}>Oops! Your browser is not supported. Soothe works best on:</p>
      <ul className={'browser-list'}>
        <li>
          <a href={'https://chromewebstore.google.com/detail/soothe-vault-beta/mcgbfmioikpilhncbhdkjbjinfhgplpa'} target={'_blank'}>
            <Image src={ChromeLogo} alt={'chrome logo'} width={50} height={50} />
            <p className={"browser"} >Chrome</p>
          </a>
        </li>
        <li>
          <a href={'https://chromewebstore.google.com/detail/soothe-vault-beta/mcgbfmioikpilhncbhdkjbjinfhgplpa'}
             target={'_blank'}>
            <Image src={BraveLogo} alt={'brave logo'} width={50} height={50} />
            <p className={"browser"}>Brave</p>
          </a>
        </li>
      </ul>
    </div>
);
}
