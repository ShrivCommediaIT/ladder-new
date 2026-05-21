
import ChooseGame, { GameSelect } from "@/components/pages/games/GameSelect";
import LadderBenefits from "@/components/pages/payment/LadderBenefits";
import PlanHeading from "@/components/pages/payment/PlanHeading";
import OnboardingFlow from "@/components/shared/OnboardingFlow";
import PerformanceDatabase from "@/components/shared/PerformanceDatabase";


export default function Home() {
  return (
    <>
        <OnboardingFlow />
        <div className=" min-h-screen">
          {/* <GameSelect /> */}
            <div>
              <PlanHeading />
            </div>

            <div className="bg-[#05070f] border-t border-b border-white/5 relative z-10">
              <PerformanceDatabase />
            </div>

            <div>
              <LadderBenefits />
            </div>
        </div>
    </>
  );
}