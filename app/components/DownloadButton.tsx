import { headers } from 'next/headers'
import Image from 'next/image'
import ChromeLogo from '../assets/chrome.svg'
import BraveLogo from '../assets/brave.svg'
import FirefoxLogo from '../assets/firefox.svg'

const chromeLink = 'https://chrome.google.com/webstore/detail/soothe-vault/mcgbfmioikpilhncbhdkjbjinfhgplpa'
const firefoxLink = 'https://addons.mozilla.org/en-GB/firefox/addon/soothe-vault/'

export default async function DownloadButton() {
  const userAgent = (await headers()).get('user-agent')

  const isFirefox = userAgent && /Firefox/.test(userAgent)
  const isSupportedBrowser = userAgent && (/Chrome/.test(userAgent) || isFirefox)

  if (isSupportedBrowser) {
    return (
      <a className={"primary-btn bigger-btn"} style={{ marginTop: 10 }} href={isFirefox ? firefoxLink : chromeLink} target={'_blank'}>
        Download Soothe Vault
      </a>
    );
  }

  return (
    <div className={"unsupported-browser"}>
      <p className={"unsupported-title"}>Oops! Your browser is not supported. Soothe works best on:</p>
      <ul className={'browser-list'}>
        <li>
          <a href={chromeLink} target={'_blank'}>
            <Image src={ChromeLogo} alt={'chrome logo'} width={50} height={50} />
            <p className={"browser"} >Chrome</p>
          </a>
        </li>
        <li>
          <a href={chromeLink}
             target={'_blank'}>
            <Image src={BraveLogo} alt={'brave logo'} width={50} height={50} />
            <p className={"browser"}>Brave</p>
          </a>
        </li>
        <li>
          <a href={firefoxLink}
             target={'_blank'}>
            <Image src={FirefoxLogo} alt={'brave logo'} width={50} height={50} />
            <p className={"browser"}>Firefox</p>
          </a>
        </li>
      </ul>
    </div>
);
}
