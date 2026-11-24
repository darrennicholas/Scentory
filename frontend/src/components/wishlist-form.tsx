'use client';

import { GlobalDropdown } from '@/components/global-dropdown';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FieldError } from '@/components/field-error';
import { useSaveFeedback } from '@/components/providers';
import { apiRequest } from '@/lib/api';
import { concentrations, families, label, WishlistItem } from '@/lib/models';

type Form = { name: string; brand: string; concentration: string; fragranceFamily: string; imageUrl: string; estimatedPrice: string; priority: string; notes: string };
const blank: Form = { name: '', brand: '', concentration: '', fragranceFamily: '', imageUrl: '', estimatedPrice: '', priority: 'MEDIUM', notes: '' };

export function WishlistForm({ item, onCancel, onSaved }: { item?: WishlistItem; onCancel?: () => void; onSaved?: () => void }) {
  const router = useRouter();
  const qc = useQueryClient();
  const runSave = useSaveFeedback();
  const [form, setForm] = useState<Form>(item ? {
    name: item.name,
    brand: item.brand,
    concentration: item.concentration,
    fragranceFamily: item.fragranceFamily ?? '',
    imageUrl: item.imageUrl ?? '',
    estimatedPrice: item.estimatedPrice ?? '',
    priority: item.priority,
    notes: item.notes ?? '',
  } : blank);

  const save = useMutation({
    meta: { feedbackHandled: true },
    mutationFn: () => runSave(
      () => apiRequest(`/wishlist${item ? `/${item.id}` : ''}`, {
        method: item ? 'PATCH' : 'POST',
        body: JSON.stringify({ ...form, fragranceFamily: form.fragranceFamily || null, imageUrl: form.imageUrl || null, estimatedPrice: form.estimatedPrice || null }),
      }),
      item ? 'Wishlist item updated.' : 'Fragrance added to your wishlist.',
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      qc.invalidateQueries({ queryKey: ['insights'] });
      if (onSaved) onSaved();
      else router.push('/wishlist');
    },
  });

  const set = (field: keyof Form, value: string) => setForm(current => ({ ...current, [field]: value }));
  return <form className="wishlist-form" onSubmit={event => { event.preventDefault(); save.mutate(); }}>
    <h2>{item ? 'Edit wishlist item' : 'Fragrance details'}</h2>
    <div className="form-grid">
      <label className="wide">Name *<input required minLength={2} maxLength={120} value={form.name} onChange={event => set('name', event.target.value)} /><FieldError error={save.error} field="name" /></label>
      <label>Brand *<input required minLength={2} maxLength={100} value={form.brand} onChange={event => set('brand', event.target.value)} /><FieldError error={save.error} field="brand" /></label>
      <div className="dropdown-field"><label htmlFor="wishlist-concentration">Concentration *</label><GlobalDropdown id="wishlist-concentration" required value={form.concentration} onValueChange={value => set('concentration', value)}><option value="">Select concentration</option>{concentrations.map(value => <option key={value} value={value}>{label(value)}</option>)}</GlobalDropdown><FieldError error={save.error} field="concentration" /></div>
      <div className="dropdown-field"><label htmlFor="wishlist-family">Family</label><GlobalDropdown id="wishlist-family" value={form.fragranceFamily} onValueChange={value => set('fragranceFamily', value)}><option value="">Not specified</option>{families.map(value => <option key={value} value={value}>{label(value)}</option>)}</GlobalDropdown><FieldError error={save.error} field="fragranceFamily" /></div>
      <div className="dropdown-field"><label htmlFor="wishlist-priority">Priority *</label><GlobalDropdown id="wishlist-priority" value={form.priority} onValueChange={value => set('priority', value)}>{['HIGH', 'MEDIUM', 'LOW'].map(value => <option key={value} value={value}>{label(value)}</option>)}</GlobalDropdown><FieldError error={save.error} field="priority" /></div>
      <label>Estimated price (IDR)<input type="number" min="0" step="0.01" value={form.estimatedPrice} onChange={event => set('estimatedPrice', event.target.value)} /><FieldError error={save.error} field="estimatedPrice" /></label>
      <label className="wide">Image URL or local image path<input type="text" inputMode="url" placeholder="https://… or /storage/images/…" value={form.imageUrl} onChange={event => set('imageUrl', event.target.value)} /><FieldError error={save.error} field="imageUrl" /></label>
      <label className="wide">Notes<textarea maxLength={1000} value={form.notes} onChange={event => set('notes', event.target.value)} /><FieldError error={save.error} field="notes" /></label>
    </div>
    {save.isError && <p className="error" role="alert">{save.error.message}</p>}
    <div className="form-actions"><button type="button" className="btn secondary" onClick={onCancel ?? (() => router.back())}>Cancel</button><button className="btn" disabled={save.isPending}>{item ? 'Save changes' : 'Save to wishlist'}</button></div>
  </form>;
}
