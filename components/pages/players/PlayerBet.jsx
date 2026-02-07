// playerBet.jsx


"use client";
import { Input } from "@/components/ui/input";


const PlayerBet = ({ betDescription, setBetDescription }) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <label className="font-semibold block">Bet loser has to : (leave blank if no bet)</label>
        <Input
          placeholder="e.g. Loser buys winner a Pint 🍹"
          value={betDescription}
          onChange={(e) => setBetDescription(e.target.value)}
        />
      </div>
    </div>
  );
};

export default PlayerBet;


 
 
 

