import { Link } from "react-router-dom";
import SectionHeader from "../../components/public/SectionHeader";
import Seo from "../../components/Seo";
import { useSiteData } from "../../contexts/SiteDataContext";

function BlogListPage() {
  const { blogs } = useSiteData();

  return (
    <section className="py-16">
      <Seo
        title="Knowledge Center"
        description="Read Maanak Labs articles and seed quality guidance for germination, storage decisions, sample handling, and practical testing awareness."
        canonicalPath="/blogs"
        image="/images/maanak-germination-tray-2.jpeg"
        keywords="seed quality blog, germination guidance, seed storage guidance, agricultural quality knowledge center"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Knowledge center"
          title="Blogs for seed quality awareness"
          description="Use this section to share practical guidance with growers, channel partners, and production teams."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {blogs.map((blog) => (
            <article key={blog._id} className="panel overflow-hidden">
              <img src={blog.coverImage} alt={blog.title} className="h-56 w-full object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-bold">{blog.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{blog.excerpt}</p>
                <Link to={`/blogs/${blog.slug}`} className="mt-6 inline-flex text-sm font-semibold text-brand-blue">
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BlogListPage;
