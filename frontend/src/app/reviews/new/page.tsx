'use client';
import {useEffect,useState} from 'react';
import {ReviewForm} from '@/components/review-form';
export default function NewReview(){const [id,setId]=useState<string|null>(null);useEffect(()=>setId(new URLSearchParams(window.location.search).get('perfumeId')||''),[]);return <main className="page"><p className="eyebrow">Your scent journal</p><div className="page-heading"><div><h1>Record Personal Impression</h1><p className="muted">A personal account of your fragrance experience.</p></div></div>{id!==null&&<ReviewForm initialPerfumeId={id}/>}</main>}
