import SectionHeader from "../../components/public/SectionHeader";
import Seo from "../../components/Seo";
import SampleGuideSection from "../../components/public/SampleGuideSection";

function SampleGuidelinesPage() {
  return (
    <>
      <Seo
        title="Sample Submission Guidelines"
        description="Follow Maanak Labs sample submission guidelines to withdraw, pack, label, and dispatch representative seed samples correctly for testing."
        canonicalPath="/sample-guidelines"
        image="/images/pack-sample-bag.jpg"
        keywords="sample submission guidelines, seed sample packing, seed sample dispatch, representative seed sample"
      />
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Sample submission guidelines"
            title="Make sure each sample reaches the lab correctly packed and clearly identified"
            description="This page uses very simple instructions so farmers, dealers, seed companies, and distributors can dispatch samples with confidence."
          />
        </div>
      </section>
      <SampleGuideSection />
    </>
  );
}

export default SampleGuidelinesPage;
