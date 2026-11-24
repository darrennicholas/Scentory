import type {Metadata} from 'next';
import Link from 'next/link';
import {Navigation} from '@/components/navigation';
import {PageTransition} from '@/components/page-transition';
import {Providers} from '@/components/providers';
import './globals.css';
export const metadata:Metadata={title:'Scentory',description:'Every Scent Tells a Story'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body><Providers><header className="site-header"><Link className="logo" href="/">SCENTORY</Link><Navigation/></header><PageTransition>{children}</PageTransition><footer className="site-footer"><Link className="logo" href="/">SCENTORY</Link><span>Personal Fragrance Collection &amp; Olfactory Archive</span><span>SCENTORY</span></footer></Providers></body></html>}
