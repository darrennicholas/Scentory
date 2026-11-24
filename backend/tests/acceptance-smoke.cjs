const assert=require('node:assert/strict');const base=process.env.API_URL||'http://127.0.0.1:5000/api';const tag=`FSD${Date.now()}${Math.random().toString(36).slice(2,7)}`;const ids=[];
async function req(path,method='GET',data){const r=await fetch(base+path,{method,headers:{'content-type':'application/json'},...(data===undefined?{}:{body:JSON.stringify(data)})});return{status:r.status,body:r.status===204?null:await r.json()}}
(async()=>{try{
 let r=await req('/perfumes/not-a-uuid');assert.equal(r.status,400);
 r=await req('/perfumes','POST',{name:'  ',brand:'A brand',concentration:'PARFUM',fragranceFamily:'WOODY'});assert.equal(r.status,400);
 r=await req('/perfumes','POST',{name:tag,brand:'A brand',concentration:'PARFUM',fragranceFamily:'WOODY',purchasePrice:'-1'});assert.equal(r.status,400);
 r=await req('/perfumes','POST',{name:tag,brand:'A brand',concentration:'PARFUM',fragranceFamily:'WOODY',notes:[{noteId:'00000000-0000-4000-8000-000000000000',layer:'TOP'}]});assert.equal(r.status,409);
 r=await req(`/perfumes?search=${tag}`);assert.equal(r.body.meta.total,0);
 for(let i=0;i<13;i++){r=await req('/perfumes','POST',{name:`${tag} ${i}`,brand:'A brand',concentration:'PARFUM',fragranceFamily:'WOODY'});assert.equal(r.status,201);ids.push(r.body.data.id)}
 r=await req(`/perfumes?search=${tag}&page=2&limit=12`);assert.equal(r.status,200);assert.equal(r.body.meta.total,13);assert.equal(r.body.data.length,1);
 r=await req('/reviews','POST',{perfumeId:ids[0],overallRating:6});assert.equal(r.status,400);
 r=await req('/wishlist','POST',{name:tag,brand:'A brand',concentration:'PARFUM',priority:'UNKNOWN'});assert.equal(r.status,400);
 console.log('Validation and pagination acceptance checks passed');
}finally{for(const id of ids)await req(`/perfumes/${id}`,'DELETE')}})().catch(e=>{console.error(e);process.exitCode=1});
