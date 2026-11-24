const assert=require('node:assert/strict');
const base=process.env.API_URL||'http://127.0.0.1:5000/api';
const suffix=`${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
let wish,perfume,review;
async function req(path,method='GET',data){const r=await fetch(base+path,{method,headers:{'content-type':'application/json'},...(data===undefined?{}:{body:JSON.stringify(data)})});return {status:r.status,body:r.status===204?null:await r.json()};}
(async()=>{try{
 let r=await req('/wishlist','POST',{name:`Test ${suffix}`,brand:'Test Brand',concentration:'EAU_DE_PARFUM',priority:'HIGH'});assert.equal(r.status,201);wish=r.body.data.id;
 const payload={name:`Test ${suffix}`,brand:'Test Brand',concentration:'EAU_DE_PARFUM',fragranceFamily:'WOODY',notes:[{noteId:'00000000-0000-4000-8000-000000000000',layer:'TOP'}]};
 r=await req(`/wishlist/${wish}/convert`,'POST',payload);assert.equal(r.status,409);r=await req(`/wishlist/${wish}`);assert.equal(r.status,200);
 r=await req(`/wishlist/${wish}/convert`,'POST',{...payload,notes:[]});assert.equal(r.status,201);perfume=r.body.data.id;wish=undefined;
 r=await req('/reviews','POST',{perfumeId:perfume,overallRating:4,reviewText:'Test'});assert.equal(r.status,201);review=r.body.data.id;
 r=await req('/reviews','POST',{perfumeId:perfume,overallRating:5});assert.equal(r.status,409);
 r=await req(`/reviews/${review}`,'PATCH',{overallRating:5});assert.equal(r.status,200);assert.equal(r.body.data.overallRating,5);
 r=await req(`/reviews/${review}`,'DELETE');assert.equal(r.status,204);review=undefined;
 r=await req(`/perfumes/${perfume}`,'DELETE');assert.equal(r.status,204);perfume=undefined;
 console.log('Journal smoke test passed');
 }finally{if(review)await req(`/reviews/${review}`,'DELETE');if(perfume)await req(`/perfumes/${perfume}`,'DELETE');if(wish)await req(`/wishlist/${wish}`,'DELETE');}})().catch(e=>{console.error(e);process.exitCode=1});
