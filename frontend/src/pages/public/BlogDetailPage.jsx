import { useMemo } from "react";
import { useParams } from "react-router-dom";
import SectionHeader from "../../components/public/SectionHeader";
import { useSiteData } from "../../contexts/SiteDataContext";

function BlogDetailPage() {
  const { slug } = useParams();
  const { blogs } = useSiteData();
  const blog = useMemo(() => blogs.find((item) => item.slug === slug), [blogs, slug]);

  if (!blog) {
    return (
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="panel p-8">Blog not found.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Knowledge center" title={blog.title} description={blog.excerpt} />
        <article className="panel mt-10 overflow-hidden">
          <img src={blog.coverImage} alt={blog.title} className="h-72 w-full object-cover" />
          <div className="p-8 text-base leading-8 text-slate-700" dangerouslySetInnerHTML={{ __html: blog.content }} />
        </article>
      </div>
    </section>
  );
}

export default BlogDetailPage;
