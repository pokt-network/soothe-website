import type { Metadata } from "next";
import "./globals.css";
import Image from 'next/image'
import Link from 'next/link'
import localFont from 'next/font/local'

const euclid = localFont({
  src: [
    {
      path: './assets/fonts/euclidCircularB-Regular.woff2',
      weight: '400',
      style: 'normal'
    },
    {
      path: './assets/fonts/euclidCircularB-Bold.woff2',
      weight: '500',
      style: 'normal'
    },
  ], fallback: ["sans-serif"],
})

export const metadata: Metadata = {
  title: "Soothe",
  description: "Soothe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body id={"body"} className={euclid.className}>
        <nav>
          <div className={"nav-container"}>
            <Link href={'/'}>
              <Image
                src="/soothe_logo.svg"
                alt="Soothe Logo"
                width={160}
                height={30}
                priority
              />
            </Link>
            <div className={"button-container"}>
              <Link className={'simple-link'} href={'/about'}>About</Link>
              <a className={'primary-btn'} href={'mailto:contact@trustsoothe.io'}>Contact Us</a>
            </div>
          </div>
        </nav>
        {children}
      <footer>
        <div className={"footer-container"}>
          <Image
            className="footer-image"
            src="/soothe_logo.svg"
            alt="Soothe Logo"
            width={130}
            height={26}
          />
          <div className={"link-section"}>
            <div className={"footer-links-container"}>
              <Link className={"simple-link"} href={"/"}>Home</Link>
              <Link className={"simple-link"} href={"/about"}>About</Link>
              <Link className={"simple-link"} href={"/#download-section"}>Download</Link>
              <Link className={"simple-link"} href={"/privacy"}>Privacy Policy</Link>
            </div>
          </div>
          <p className={"copyright"}>©{new Date().getFullYear()} Soothe. All rights reserved.</p>
        </div>

      </footer>
      </body>
    </html>
  );
}
