import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../../api/client";
import Seo from "../../components/Seo";
import SectionHeader from "../../components/public/SectionHeader";

function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/public/blogs/${slug}`)
      .then((response) => setBlog(response.blog))
      .catch(() => setBlog(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="panel p-8">Loading article...</div>
        </div>
      </section>
    );
  }

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
      <Seo
        title={blog.title}
        description={blog.excerpt}
        canonicalPath={`/blogs/${blog.slug}`}
        image={blog.coverImage || "/images/maanak-germination-tray-2.jpeg"}
        keywords={`${blog.title}, seed quality article, Maanak Labs blog`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: blog.title,
          description: blog.excerpt,
          image: blog.coverImage ? `https://maanaklabs.com${blog.coverImage}` : "https://maanaklabs.com/images/maanak-germination-tray-2.jpeg",
          publisher: {
            "@type": "Organization",
            name: "Maanak Labs",
            logo: {
              "@type": "ImageObject",
              url: "https://maanaklabs.com/images/maanak-labs-logo.png",
            },
          },
        }}
      />
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
