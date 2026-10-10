import { notFound } from "next/navigation";
import { first } from "@/lib/db";
import type { Post } from "@/lib/data";
import { isoToWibLocal } from "@/lib/time";
import { mediaUrl } from "@/lib/url";
import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { savePost } from "../actions";
import { PostForm } from "../post-form";

export const metadata = { title: "Ubah berita" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await first<Post>("SELECT * FROM posts WHERE id = ?", id);
  if (!post) notFound();
  return (
    <>
      <AdminPageHeader title="Ubah berita" back={{ href: "/admin/berita", label: "Berita" }} />
      <Panel>
        <PostForm action={savePost.bind(null, id)} post={post} coverUrl={mediaUrl(post.cover_key)} publishedLocal={isoToWibLocal(post.published_at)} />
      </Panel>
    </>
  );
}
