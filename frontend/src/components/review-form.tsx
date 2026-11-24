'use client';

import { GlobalDropdown } from '@/components/global-dropdown';
import { FieldError } from '@/components/field-error';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiAll, apiRequest } from '@/lib/api';
import { Perfume, Review } from '@/lib/models';
import { useSaveFeedback } from '@/components/providers';
import { clientFieldErrors, reviewFormSchema } from '@/lib/form-validation';
import { z } from 'zod';

type Payload = z.infer<typeof reviewFormSchema>;

export function ReviewForm({ review, initialPerfumeId = '' }: { review?: Review; initialPerfumeId?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const runSave = useSaveFeedback();
  const [perfumeId, setPerfume] = useState(review?.perfumeId ?? initialPerfumeId);
  const [overallRating, setOverall] = useState(review?.overallRating ?? 0);
  const [longevityRating, setLongevity] = useState(review?.longevityRating ?? 0);
  const [projectionRating, setProjection] = useState(review?.projectionRating ?? 0);
  const [reviewText, setText] = useState(review?.reviewText ?? '');
  const [testedDate, setDate] = useState(review?.testedDate?.slice(0, 10) ?? '');
  const [clientErrors, setClientErrors] = useState<Record<string, string[]>>({});
  const perfumes = useQuery({ queryKey: ['perfumes', 'review-form'], queryFn: () => apiAll<Perfume>('/perfumes') });
  const save = useMutation({
    meta: { feedbackHandled: true },
    mutationFn: (payload: Payload) => runSave(() => apiRequest(`/reviews${review ? `/${review.id}` : ''}`, {
      method: review ? 'PATCH' : 'POST', body: JSON.stringify(payload),
    }), review ? 'Review updated.' : 'Experience saved to your journal.'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['perfumes'] });
      qc.invalidateQueries({ queryKey: ['insights'] });
      router.push('/reviews');
    },
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = reviewFormSchema.safeParse({ perfumeId, overallRating, longevityRating: longevityRating || null, projectionRating: projectionRating || null, reviewText, testedDate });
    if (!result.success) { setClientErrors(clientFieldErrors(result.error)); return; }
    setClientErrors({});
    save.mutate(result.data);
  };
  const stars = (field: string, title: string, value: number, set: (next: number) => void, required = false) => <fieldset className="note-row">
    <legend>{title}{required ? ' *' : ''}</legend>
    <div className="rating-control">{[1, 2, 3, 4, 5].map(star => <label key={star} className="rating-option">
      <input className="sr-only" type="radio" name={field} value={star} aria-label={`${star} of 5`} checked={value === star} required={required} onChange={() => set(star)} />
      <span><Star size={25} fill={star <= value ? 'currentColor' : 'none'} /></span>
    </label>)}<span className="muted">{value ? ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'][value - 1] : 'Not rated'}</span>
      {!required && value > 0 && <button className="link-button" type="button" onClick={() => set(0)}>Clear</button>}
    </div><FieldError error={save.error} field={field} clientErrors={clientErrors} />
  </fieldset>;

  return <form onSubmit={submit} className="form-layout">
    <aside className="panel"><h2>Personal Impression</h2><p className="muted">Capture how your fragrance wears and the memories it evokes.</p></aside>
    <div className="panel">
      <div className="dropdown-field"><label htmlFor="review-perfume">Perfume *</label><GlobalDropdown id="review-perfume" required value={perfumeId} disabled={!!review} onValueChange={value => setPerfume(value)}><option value="">Select a fragrance</option>{perfumes.data?.filter(perfume => !perfume.review || perfume.id === review?.perfumeId).map(perfume => <option key={perfume.id} value={perfume.id}>{perfume.brand} — {perfume.name}</option>)}</GlobalDropdown><FieldError error={save.error} field="perfumeId" clientErrors={clientErrors} /></div>
      {perfumes.isError && <p className="error">Could not load fragrances. <button type="button" onClick={() => perfumes.refetch()}>Try again</button></p>}
      {!perfumes.isLoading && !perfumes.data?.length && <p className="muted">Add a perfume before writing a review. <Link href="/perfumes/new">Add perfume →</Link></p>}
      {stars('overallRating', 'Overall rating', overallRating, setOverall, true)}
      {stars('longevityRating', 'Longevity', longevityRating, setLongevity)}
      {stars('projectionRating', 'Projection', projectionRating, setProjection)}
      <label>Review<textarea maxLength={2000} value={reviewText} onChange={event => setText(event.target.value)} /><FieldError error={save.error} field="reviewText" clientErrors={clientErrors} /></label>
      <label style={{ marginTop: 18 }}>Tested date<input type="date" max={new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())} value={testedDate} onChange={event => setDate(event.target.value)} /><FieldError error={save.error} field="testedDate" clientErrors={clientErrors} /></label>
      {save.isError && <p className="error" role="alert">{save.error.message}</p>}
      <div className="form-actions"><button type="button" className="btn secondary" onClick={() => router.back()}>Cancel</button><button className="btn" disabled={save.isPending || !perfumes.data?.length}>Save review</button></div>
    </div>
  </form>;
}
