'use client';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import {useParams} from 'next/navigation';
import {useQuery} from '@tanstack/react-query';
import {apiRequest} from '@/lib/api';
import {Review} from '@/lib/models';
import {ReviewForm} from '@/components/review-form';
export default function EditReview(){const {id}=useParams<{id:string}>();const q=useQuery({queryKey:['reviews',id],queryFn:()=>apiRequest<{data:Review}>(`/reviews/${id}`)});return <main className="page"><h1>Edit Olfactory Review</h1>{q.isLoading?<LoadingSkeleton variant="detail" label="Loading review" />:q.isError||!q.data?<p className="error">Could not load review. <button onClick={()=>q.refetch()}>Try again</button></p>:<ReviewForm review={q.data.data}/>}</main>}
