const assert = require('node:assert/strict');
const base = process.env.API_URL || 'http://127.0.0.1:5000/api';
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
let noteId, perfumeId;
async function request(path, method = 'GET', data) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
  return { status: response.status, body: response.status === 204 ? null : await response.json() };
}
(async () => {
  try {
    let result = await request('/fragrance-notes', 'POST', { name: `Test ${suffix}`, category: 'CITRUS' });
    assert.equal(result.status, 201); noteId = result.body.data.id;
    result = await request('/fragrance-notes', 'POST', { name: ` test ${suffix.toUpperCase()} `, category: 'CITRUS' });
    assert.equal(result.status, 409);
    result = await request('/perfumes', 'POST', { name: `Test ${suffix}`, brand: 'Test Brand', concentration: 'EAU_DE_PARFUM', fragranceFamily: 'CITRUS', notes: [{ noteId, layer: 'TOP' }] });
    assert.equal(result.status, 201); perfumeId = result.body.data.id;
    result = await request(`/fragrance-notes/${noteId}`, 'DELETE'); assert.equal(result.status, 409);
    result = await request(`/perfumes/${perfumeId}`); assert.equal(result.body.data.notes[0].noteId, noteId);
    result = await request(`/perfumes/${perfumeId}`, 'DELETE'); assert.equal(result.status, 204); perfumeId = undefined;
    result = await request(`/fragrance-notes/${noteId}`, 'DELETE'); assert.equal(result.status, 204); noteId = undefined;
    console.log('Library smoke test passed');
  } finally {
    if (perfumeId) await request(`/perfumes/${perfumeId}`, 'DELETE');
    if (noteId) await request(`/fragrance-notes/${noteId}`, 'DELETE');
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
