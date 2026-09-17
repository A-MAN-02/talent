import HeroSection from './HeroSection';
import TrustStrip from './TrustStrip';
import AnswerSection from './AnswerSection';
import ProblemSection from './ProblemSection';
import ProcessPreview from './ProcessPreview';
import AIAdvantageSection from './AIAdvantageSection';
import ExpertisePreview from './ExpertisePreview';
import EngagementPreview from './EngagementPreview';
import WhyBharyatTeaser from './WhyBharyatTeaser';
import IndustriesStrip from './IndustriesStrip';
import GroupStats from './GroupStats';
import InsightsPreview from './InsightsPreview';
import FinalCTA from './FinalCTA';

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <ProblemSection />
      <AnswerSection />
      <ProcessPreview />
      <AIAdvantageSection />
      <ExpertisePreview />
      <EngagementPreview />
      <WhyBharyatTeaser />
      <IndustriesStrip />
      <GroupStats />
      <InsightsPreview />
      <FinalCTA />
    </>
  );
}