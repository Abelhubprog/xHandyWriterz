export const BASE = '/api/content';

export async function getDomains() {
  const r = await fetch(`${BASE}/domains`);
  if (!r.ok) throw new Error('domains_failed');
  return r.json();
}

export async function getPosts(domain: string) {
  const r = await fetch(`${BASE}/posts?domain=${encodeURIComponent(domain)}&status=published`);
  if (!r.ok) throw new Error('posts_failed');
  return r.json();
}

export async function getPost(domain: string, slug: string) {
  const r = await fetch(`${BASE}/posts/${encodeURIComponent(domain)}/${encodeURIComponent(slug)}`);
  if (!r.ok) throw new Error('post_failed');
  return r.json();
}

export async function createPost(token: string, body: any) {
  const r = await fetch(`${BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  return r.json();
}

export async function reactToPost(id: number, token: string, kind: 'like' | 'bookmark') {
  const r = await fetch(`${BASE}/posts/${id}/react`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ kind })
  });
  return r.json();
}

export async function votePost(id: number, token: string, value: 1 | -1) {
  const r = await fetch(`${BASE}/posts/${id}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ value })
  });
  return r.json();
}

export async function commentOnPost(id: number, token: string, body: string) {
  const r = await fetch(`${BASE}/posts/${id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ body })
  });
  return r.json();
}
