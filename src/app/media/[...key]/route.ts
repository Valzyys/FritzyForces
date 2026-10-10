import { getBucket } from "@/lib/cf";

/** Menyajikan gambar publik dari R2. Hanya prefix "u/" yang diizinkan. */
export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await params;
  const key = parts.map(decodeURIComponent).join("/");
  if (!key.startsWith("u/") || key.includes("..") || key.length > 300) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const bucket = await getBucket();
    const object = await bucket.get(key, { onlyIf: request.headers });
    if (!object) return new Response("Not found", { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "public, max-age=31536000, immutable");
    headers.set("x-content-type-options", "nosniff");
    headers.set("content-security-policy", "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'");
    if (!("body" in object) || !object.body) return new Response(null, { status: 304, headers });
    return new Response(object.body, { headers });
  } catch (err) {
    console.error("[media] gagal membaca:", err instanceof Error ? err.message : err);
    return new Response("Unavailable", { status: 503 });
  }
}
