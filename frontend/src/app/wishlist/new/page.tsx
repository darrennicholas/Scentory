'use client';

import Link from 'next/link';
import { WishlistForm } from '@/components/wishlist-form';

export default function NewWishlistItem() {
  return <main className="page">
    <p className="eyebrow">A personal fragrance wish list</p>
    <div className="page-heading"><div><h1>Add to your wishlist</h1><p className="muted">Keep a fragrance in view for the day you are ready to discover it.</p></div></div>
    <div className="form-layout wishlist-form-layout"><section className="panel"><WishlistForm /></section><aside className="panel"><h2>A note for later</h2><p className="muted">Set a priority and an estimated price to help plan what you would like to explore next.</p><Link href="/wishlist">Back to wishlist</Link></aside></div>
  </main>;
}
