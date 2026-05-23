
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
        </div>
    </>
  );
}
