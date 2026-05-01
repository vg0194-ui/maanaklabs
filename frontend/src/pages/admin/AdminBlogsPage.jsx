import { useEffect, useState } from "react";
import { apiFetch } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";

const initialBlog = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "/images/sample-withdrawal.jpg",
  tags: "",
  isPublished: true,
};

function AdminBlogsPage() {
  const { token } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(initialBlog);

  const fetchBlogs = async () => {
    const response = await apiFetch("/admin/blogs", { token });
    setBlogs(response.blogs);
  };

  useEffect(() => {
    fetchBlogs().catch(() => setBlogs([]));
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await apiFetch("/admin/blogs", {
      method: "POST",
      token,
      body: { ...form, tags: String(form.tags).split(",").map((tag) => tag.trim()).filter(Boolean) },
    });
    setForm(initialBlog);
    fetchBlogs();
  };

  const handleDelete = async (blogId) => {
    await apiFetch(`/admin/blogs/${blogId}`, { method: "DELETE", token });
    fetchBlogs();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[420px,1fr]">
      <div className="panel p-6">
        <h1 className="text-3xl font-extrabold">Manage blogs</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input className="field" placeholder="Blog title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <input className="field" placeholder="Cover image path" value={form.coverImage} onChange={(event) => setForm({ ...form, coverImage: event.target.value })} />
          <textarea className="field min-h-24" placeholder="Excerpt" value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} />
          <textarea className="field min-h-40" placeholder="HTML content" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} />
          <input className="field" placeholder="Tags separated by comma" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
          <button type="submit" className="btn-primary w-full">
            Publish blog
          </button>
        </form>
      </div>
      <div className="panel overflow-x-auto p-6">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Title</th>
              <th className="pb-3">Excerpt</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog._id} className="border-t border-slate-100">
                <td className="py-4 font-semibold text-slate-800">{blog.title}</td>
                <td className="py-4">{blog.excerpt}</td>
                <td className="py-4">
                  <button type="button" onClick={() => handleDelete(blog._id)} className="text-sm font-semibold text-rose-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminBlogsPage;
