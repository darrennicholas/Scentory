'use client';
import Link from 'next/link';
import { Perfume, label } from '@/lib/models';
import { ImageFallback } from '@/components/image-fallback';
export function PerfumeCard({perfume:p}:{perfume:Perfume}) {
 return <article className="card"><Link href={`/perfumes/${p.id}`}><ImageFallback className="card-image" src={p.imageUrl} alt={p.name}/><p className="brand">{p.brand}</p><h3>{p.name}</h3><div className="card-bottom"><span className="badge">{label(p.fragranceFamily)}</span><span className="card-concentration">{label(p.concentration)}</span>{p.review && <span className="card-rating" aria-label={`Overall rating ${p.review.overallRating} out of 5`}>★ {p.review.overallRating}</span>}</div></Link></article>;
}
