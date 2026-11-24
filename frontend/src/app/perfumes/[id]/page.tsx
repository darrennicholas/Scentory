'use client';
import Link from 'next/link';
import { useParams,useRouter } from 'next/navigation';
import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { ImageFallback } from '@/components/image-fallback';
import { label,Perfume } from '@/lib/models';
export default function PerfumeDetail() {
 const {id}=useParams<{id:string}>(); const router=useRouter(); const qc=useQueryClient();
 const q=useQuery({queryKey:['perfumes',id],queryFn:()=>apiRequest<{data:Perfume}>(`/perfumes/${id}`)});
 const del=useMutation({mutationFn:()=>apiRequest(`/perfumes/${id}`,{method:'DELETE'}),onSuccess:()=>{qc.invalidateQueries({queryKey:['perfumes'],refetchType:'none'});qc.invalidateQueries({queryKey:['notes']});qc.invalidateQueries({queryKey:['collections']});qc.invalidateQueries({queryKey:['reviews']});qc.invalidateQueries({queryKey:['insights']});router.push('/perfumes')}});
 if(q.isLoading)return <main className="page">Loading fragrance…</main>; if(q.isError || !q.data)return <main className="page"><p className="error">Could not load this fragrance.</p><button onClick={()=>q.refetch()}>Try again</button></main>;
 const p=q.data.data; return <main className="page"><Link href="/perfumes">← Back to collection</Link><div className="detail-grid" style={{marginTop:40}}><div><ImageFallback className="card-image detail-image" src={p.imageUrl} alt={p.name}/></div><div><p className="eyebrow">{p.brand}</p><h1>{p.name}</h1><p className="muted">{label(p.concentration)} · {label(p.fragranceFamily)} {p.volumeMl ? `· ${p.volumeMl} ml`:''}</p><p className="muted">{p.description}</p><div className="actions" style={{margin:'28px 0'}}><Link className="btn" href={`/perfumes/${id}/edit`}>Edit perfume</Link><button className="btn secondary" disabled={del.isPending} onClick={()=>{if(confirm('Permanently delete this perfume? Its review will also be deleted.'))del.mutate()}}>Delete</button></div>{del.isError && <p className="error">Could not delete fragrance. Try again.</p>}<section className="panel"><h2>Fragrance Pyramid</h2>{['TOP','MIDDLE','BASE'].map(layer=><div className="note-row" key={layer}><strong>{label(layer)} notes</strong><span>{p.notes.filter(n=>n.layer===layer).map(n=>n.note.name).join(' · ') || 'No notes added'}</span></div>)}</section><section className="panel"><h2>Personal Review</h2>{p.review ? <><p>★ {p.review.overallRating} / 5</p>{p.review.reviewText && <p className="muted">{p.review.reviewText}</p>}{p.review.longevityRating && <p>Longevity: {p.review.longevityRating} / 5</p>}{p.review.projectionRating && <p>Projection: {p.review.projectionRating} / 5</p>}{p.review.testedDate && <p>Tested: {new Intl.DateTimeFormat("id-ID",{dateStyle:"long",timeZone:"UTC"}).format(new Date(p.review.testedDate))}</p>}<Link href={`/reviews/${p.review.id}/edit`}>Edit review →</Link></> : <Link href={`/reviews/new?perfumeId=${p.id}`}>Write a review →</Link>}</section>{p.collections.length>0 && <section className="panel"><h2>Related Collections</h2>{p.collections.map(c=><p key={c.collection.id}><Link href={`/collections/${c.collection.id}`}>{c.collection.name} →</Link></p>)}</section>}{(p.purchasePrice||p.purchaseDate) && <section className="panel"><h2>Purchase Information</h2>{p.purchasePrice && <p>{new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(Number(p.purchasePrice))}</p>}{p.purchaseDate && <p>{new Intl.DateTimeFormat('id-ID',{dateStyle:'long',timeZone:'UTC'}).format(new Date(p.purchaseDate))}</p>}</section>}</div></div></main>;
}




