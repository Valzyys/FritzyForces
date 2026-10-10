import { AdminPageHeader, Panel } from "@/components/admin/ui";
import { savePost } from "../actions";
import { PostForm } from "../post-form";

export const metadata = { title: "Tulis berita" };

export default function NewPostPage() {
  return (
    <>
      <AdminPageHeader title="Tulis berita" back={{ href: "/admin/berita", label: "Berita" }} />
      <Panel>
        <PostForm action={savePost.bind(null, null)} />
      </Panel>
    </>
  );
}
