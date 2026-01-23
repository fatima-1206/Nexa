import HeroSection from "@/components/hero-section";
import Features  from "@/components/features-10"; 
import Preview from "@/components/textCursor";
import ContentSection  from "@/components/content-1";
import FAQsThree from "@/components/faqs-3";
import FooterDemo from "@/components/footer";
import SmoothScroll from "@/components/SmoothScroll";

export default function LandingPage() {
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-neutral-950 relative">
        <div id="home" data-scroll-section>
          <HeroSection />
        </div>
        <div data-scroll-section>
          <Preview />
        </div>
        <div id="about" data-scroll-section>
          <ContentSection />
        </div>
        <div id="features" data-scroll-section>
          <Features />
        </div>
        <div id="faqs" data-scroll-section>
          <FAQsThree />
        </div>
        <div data-scroll-section>
          <FooterDemo />
        </div>
      </div>
    </SmoothScroll>
  );
}
