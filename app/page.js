
import ChooseGame, { GameSelect } from "@/components/pages/games/GameSelect";
import LadderBenefits from "@/components/pages/payment/LadderBenefits";
import PlanHeading from "@/components/pages/payment/PlanHeading";


export default function Home() {
  return (
    <>
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