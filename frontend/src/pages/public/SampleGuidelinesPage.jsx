import SectionHeader from "../../components/public/SectionHeader";
import SampleGuideSection from "../../components/public/SampleGuideSection";

function SampleGuidelinesPage() {
  return (
    <>
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

