import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Semua halaman yang membaca D1 dirender dinamis, jadi incremental cache tidak diperlukan.
const config = defineCloudflareConfig();

// `npm run build` menjalankan OpenNext (dipakai Cloudflare Workers Builds),
// sehingga OpenNext harus memanggil `next build` langsung agar tidak berulang.
config.buildCommand = "npx next build";

export default config;
