'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, Cell, PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { apiRequest } from '@/lib/api';
import { label } from '@/lib/models';

type Insights = {
  totalPerfumes: number; totalCollections: number; totalReviews: number; totalWishlistItems: number;
  averageRating: number | null; totalPurchaseSpending: string; wishlistEstimatedTotal: string; highPriorityWishlistCount: number;
  familyDistribution: { fragranceFamily: string; _count: { _all: number } }[];
  concentrationDistribution: { concentration: string; _count: { _all: number } }[];
  topNotes: { id: string; name: string; count: number }[];
};
const rupiah = (value: string) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));
const colors = ['#b49a6c', '#596954', '#d7c6a9', '#837460', '#c7c2b5', '#9daa98', '#d1aa82', '#746a5b', '#7e8b7c', '#a68b77', '#bab2a4'];

export default function Insights() {
  const query = useQuery({ queryKey: ['insights'], queryFn: () => apiRequest<{ data: Insights }>('/insights') });
  if (query.isLoading) return <main className="page"><LoadingSkeleton variant="detail" label="Loading collection insights" /></main>;
  if (query.isError || !query.data) return <main className="page"><p className="error">Could not load insights. <button onClick={() => query.refetch()}>Try again</button></p></main>;

  const data = query.data.data;
  const families = data.familyDistribution.map(item => ({ name: label(item.fragranceFamily), count: item._count._all }));
  const concentrations = data.concentrationDistribution.map(item => ({ name: label(item.concentration), count: item._count._all }));
  return <main className="page">
    <p className="eyebrow">Your fragrance archive</p><h1>Collection Insights</h1>
    <p className="muted">A personal portrait of your fragrances, notes, and collection.</p>
    <div className="grid" style={{ margin: '35px 0' }}>
      {([['Perfumes', data.totalPerfumes], ['Collections', data.totalCollections], ['Reviews', data.totalReviews], ['Wishlist', data.totalWishlistItems]] as const).map(([name, value]) => <div className="card" key={name}><p className="eyebrow">{name}</p><h2>{value}</h2></div>)}
    </div>
    <div className="form-grid">
      <section className="panel"><h2>Fragrance Family Distribution</h2>{families.length ? <>
        <div style={{ height: 220 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={families} dataKey="count" nameKey="name" innerRadius={55} outerRadius={90}>{families.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        {families.map(item => <p key={item.name}>{item.name} — {item.count}</p>)}
      </> : <p className="muted">No fragrances yet.</p>}</section>
      <section className="panel"><h2>Concentration Distribution</h2>{concentrations.length ? <>
        <div style={{ height: 220 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={concentrations} dataKey="count" nameKey="name" innerRadius={55} outerRadius={90}>{concentrations.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        {concentrations.map(item => <p key={item.name}>{item.name} — {item.count}</p>)}
      </> : <p className="muted">No fragrances yet.</p>}</section>
      <section className="panel"><h2>Most Used Notes</h2>{data.topNotes.length ? <div style={{ height: 220 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={data.topNotes} layout="vertical" margin={{ left: 20 }}><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={100} /><Tooltip /><Bar dataKey="count" fill="#9daa98" /></BarChart></ResponsiveContainer></div> : <p className="muted">No notes used yet.</p>}</section>
      <section className="panel"><h2>Personal Snapshot</h2><p>Average rating: {data.averageRating?.toFixed(1) ?? 'No ratings yet'}</p><p>Purchase spending: {rupiah(data.totalPurchaseSpending)}</p><p>Wishlist estimate: {rupiah(data.wishlistEstimatedTotal)}</p><p>High priority: {data.highPriorityWishlistCount}</p></section>
    </div>
  </main>;
}
