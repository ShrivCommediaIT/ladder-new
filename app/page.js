
import ChooseGame, { GameSelect } from "@/components/pages/games/GameSelect";
import LadderBenefits from "@/components/pages/payment/LadderBenefits";
import PlanHeading from "@/components/pages/payment/PlanHeading";
import OnboardingFlow from "@/components/shared/OnboardingFlow";


export default function Home() {
  return (
    <>
        <OnboardingFlow />
        <div className=" min-h-screen">
          {/* <GameSelect /> */}
            <div>
              <PlanHeading />
            </div>

            <div>
              <LadderBenefits />
            </div>
        </div>
    </>
  );
}