export function siteUrl(): string {
  return (process.env.SITE_URL || "https://fritzyforce.my.id").replace(/\/+$/, "");
}
