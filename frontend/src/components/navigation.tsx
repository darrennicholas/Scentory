'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useRef} from 'react';
import {Menu} from 'lucide-react';
const links=[['Perfumes','/perfumes'],['Notes','/notes'],['Collections','/collections'],['Reviews','/reviews'],['Wishlist','/wishlist'],['Insights','/insights']];
export function Navigation(){const path=usePathname();const details=useRef<HTMLDetailsElement>(null);const items=()=>links.map(([name,href])=><Link key={href} href={href} aria-current={path===href||path.startsWith(href+'/')?'page':undefined} onClick={()=>{if(details.current)details.current.open=false}}>{name}</Link>);return <><nav className="desktop-nav" aria-label="Main navigation">{items()}</nav><details className="mobile-nav" ref={details}><summary aria-label="Open navigation"><Menu size={22}/></summary><nav aria-label="Mobile navigation">{items()}</nav></details></>}
