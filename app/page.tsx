import Image from "next/image";
import Wallet from "./assets/city.webp";
import Image1 from "./assets/image-1.webp";
import Image3 from "./assets/image-3.webp";
import styles from "./page.module.css";
import DownloadButton from '@/app/components/DownloadButton'

export default function Home() {
  return (
    <main>
      <div id={"download-section"} className={"content-container space-between row"} style={{marginTop:"220px", gap:"20px"}}>
        <div className={"grow main-text"} style={{alignSelf:"flex-start"}}>
          <h1>
            Unlock seamless control: manage all your tokens in one wallet
          </h1>
          <p>
            Experience strong security with AES 256 encryption safeguarding your data on your device, coupled with multi-factor authentication for added protection.
          </p>
          <DownloadButton />
        </div>
        <div className={styles.mainImage}>
          <Image src={Wallet} alt={"wallet image"} quality={50} fill={true} sizes={"(max-width: 1100px) 100vw, 100vw"} priority />
        </div>
      </div>

      <div className={"info-container content-container row-reverse"}>
        <div className={"text-container"}>
          <h2>
            Your web3 wallet
          </h2>
          <p>
            Available as a browser extension, Soothe Vault equips you with a key vault, secure login, token wallet, and
            more—everything you need to manage your digital assets.
          </p>
          <p>
            Seamlessly manage your tokens with a clear transaction overview. The intuitive interface simplifies wallet
            management, even for beginners, while backups ensure your data remains secure.
          </p>
        </div>
        <div className={"info-image-container x-padding"}>
          <Image src={Image1} alt={"image1"} fill={true} style={{objectFit: 'contain'}}
                 sizes={"(max-width: 500px) 100vw, 100vw"} priority/>
        </div>
      </div>

      <div className={'info-container content-container'}>
        <div className={'text-container'}>
          <h2>
            Own your data
          </h2>
          <p>
            Soothe Vault generates passwords and keys directly on your device, ensuring that only you have access to
            your accounts and data. All your information resides securely on your browser, giving you complete control
            over your privacy. You always choose what to share and what to keep private, with the peace of mind that
            your sensitive data never leaves your device.
          </p>
        </div>
        <div className={'info-image-container x-padding'}>
          <Image src={Image3} alt={'image1'} fill={true} style={{objectFit:'contain'}} sizes={'(max-width: 600px) 100vw, 100vw'} priority />
        </div>
      </div>


    </main>
  );
}
