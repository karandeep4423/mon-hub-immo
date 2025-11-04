// lib/api/fetcher.ts
export async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Erreur réseau : ${res.status} ${res.statusText}`);
  }
  return res.json();
}
