import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Semua halaman yang membaca D1 dirender dinamis, jadi incremental cache tidak diperlukan.
export default defineCloudflareConfig();
