import styles from './page.module.css'

export default function AboutPage() {
  return (
    <main>
      <div className={"content-container space-between"}
           style={{ marginTop: "150px", maxWidth: "1050px" }}>
        <h1  className={styles.title}>
          Secure and Simplify Your Digital Assets with Soothe Vault
        </h1>
        <p className={styles.description}>
          Soothe Vault is a secure, user-friendly browser extension designed to streamline the management of your digital assets. No more juggling multiple wallets or worrying about forgotten passwords. With Soothe Vault, you can effortlessly:
        </p>
      </div>


      <div className={"content-container"} style={{maxWidth: 1200}}>
        <div className={styles.cardDescriptionContainer}>
        <div className={styles.cardDescription}>
          <h2>
            Manage Your Wallets
          </h2>
          <ul>
            <li>Securely store your ETH, POKT, and wPOKT wallets directly in your browser.</li>
            <li>Easily import existing wallets or create new ones within minutes.</li>
            <li>Organize and manage all your wallets from a single, convenient interface.</li>
          </ul>
        </div>
        <div className={styles.cardDescription}>
          <h2>
            Unmatched Security
          </h2>
          <ul>
            <li>Protect your data with military-grade encryption using industry-standard AES 256.</li>
            <li>Keep your data completely private—everything stays on your device, never on remote servers.</li>
            <li>Enhance security with multi-factor authentication (MFA) for accessing your vault.</li>
          </ul>
        </div>

        <div className={styles.cardDescription}>
          <h2>
            Effortless Control
          </h2>
          <ul>
            <li>Get a clear overview of your tokens by tracking all your transactions in one place.</li>
            <li>Enjoy an intuitive interface that makes wallet management simple, even for beginners.</li>
            <li>Rest easy knowing your data is safe and secure with automatic backups.</li>
          </ul>
        </div>

        <div className={styles.cardDescription}>
          <h2>
            With Soothe Vault, you can
          </h2>
          <ul>
            <li>Consolidate all your digital assets into one secure, accessible location.</li>
            <li>Feel confident and secure with cutting-edge protection for your data.</li>
            <li>Experience a seamless, user-friendly interface that makes managing your wallets effortless.</li>
          </ul>
        </div>

      </div>
      </div>

    </main>
  )
}
