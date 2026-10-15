import BlogEditor from '@/components/admin/BlogEditor';
import { requireAdmin } from '@/lib/auth';
export default async function NewPost() {
  await requireAdmin();
  return (<><div className="dash-head"><div><span className="eyebrow">Blog</span><h1>New post</h1></div></div><BlogEditor /></>);
}
