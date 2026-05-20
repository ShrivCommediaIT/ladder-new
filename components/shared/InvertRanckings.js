import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams, useRouter } from 'next/navigation';
import { getRequest } from '@/services/apiService';
import { API_ENDPOINTS } from '@/constants/api';

// Actions from different slices
import { fetchNegativeLeaderboard } from '@/redux/slices/negativeLeaderBoardSlice';
import { fetchPositiveLeaderboard } from '@/redux/slices/positiveLeaderBoardSlice';
import { fetchSkillLeaderboard } from '@/redux/slices/BasicLeaderboardSlice';
import { fetchLeaderboard, toggleInvertRanking } from '@/redux/slices/leaderboardSlice';
import { fetchMiniLeague } from '@/redux/slices/minileagueSlice';
import { fetchRosterLeaderboard } from '@/redux/slices/rosterLeaderboardSlice';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowBigUp, ArrowDownUp } from 'lucide-react';

/**
 * Normalizes common URL type variations to the canonical strings 
 * expected by the Backend API leaderboard endpoint.
 */
const normalizeType = (rawType) => {
    const type = (rawType || "").toLowerCase().trim();
    
    // Winlose variations
    if (["winlose", "winlos", "winloss"].includes(type)) return "winlose";
    
    // Best of 3 variations
    if (["best3", "bestof3"].includes(type)) return "best3";
    
    // Best of 5 variations
    if (["best5", "bestof5"].includes(type)) return "best5";
    
    // Minileague variations
    if (["minileague", "minilegue"].includes(type)) return "minileague";
    
    // Skills variations
    if (["skill", "skills"].includes(type)) return "skill";

    // Roster
    if (type === "roster") return "roster";
    
    return type; // Return as-is if no match
};

export const InvertRanckings = () => {
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState("asc");
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isInverted, setIsInverted] = useState(false);

    const type = searchParams.get('type')
    const inverType = searchParams.get('inverted')

    const handleInvertRanckings = () => {
        setIsConfirmOpen(true);
    };

    const executeInversion = async () => {
        const newOrder = order === "asc" ? "desc" : "asc";
        const ladderId = searchParams.get('ladder_id');

        if (!ladderId) {
            console.error("No ladder_id found in URL params");
            setIsConfirmOpen(false);
            return;
        }

        try {
            // 1. Call the server-side inverter API to persist the state
            await getRequest(API_ENDPOINTS.INVERTER, {
                ladder_id: ladderId,
                order_by: 'desc' 
            });

            // 2. Update URL with inverted param
            const currentInverted = inverType === '1';
            const nextInverted = currentInverted ? '0' : '1';
            const queryParams = new URLSearchParams(searchParams.toString());
            queryParams.set('inverted', nextInverted);
            router.replace(`${window.location.pathname}?${queryParams.toString()}`);

            // 2. Sync global UI order state
            setOrder(newOrder);

            // 3. Sync global Redux invert state
            dispatch(toggleInvertRanking());

            // 4. Prepare parameters for refreshing the data
            const params = Object.fromEntries(searchParams.entries());
            
            // ✅ REMOVE orderBy from the fetch API call as requested
            delete params.order_by;
            delete params.inverted;

            // Get and Normalize type from URL
            const rawType = (params.ladder_type || params.type || "");
            const canonicalType = normalizeType(rawType);
            
            // Update params with the canonical type for the API call
            params.type = canonicalType;

            // 5. Dispatch to the specific slice that the page component is actually listening to
            switch (canonicalType) {
                case "negative":
                    dispatch(fetchNegativeLeaderboard(params));
                    break;
                case "positive":
                    dispatch(fetchPositiveLeaderboard(params));
                    break;
                case "skill":
                default:
                    dispatch(fetchSkillLeaderboard(params));
                    break;
            }
        } catch (error) {
            console.error("Failed to invert ranking on server:", error);
        } finally {
            setIsConfirmOpen(false);
        }
    };

    useEffect(() => {
        // On component mount, read the inverted state from URL and set local order state
        let Inverted
        if ((type === 'negative'&& inverType === '0')) {
            Inverted = true
        } else if(type !== 'negative'){
            Inverted = inverType === '0';
        }
        setIsInverted(Inverted);
    }, [searchParams]);
    
    // const isInverted = inverType === '1';

  return (
    <>
    <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-sm bg-[#163344] text-white border border-[#2dd4bf] rounded-xl flex flex-col items-center p-6">
          <DialogHeader>
            <DialogTitle className="text-emerald-500 text-2xl font-bold uppercase tracking-wider text-center w-full mt-2">Confirm Inversion</DialogTitle>
            <div className="w-full flex justify-center mt-2 mb-6">
                <span className="h-1 w-20 bg-[#2dd4bf] rounded-full"></span>
            </div>
            <DialogDescription className="text-lg text-white text-center">
              Are you sure you want to <b>invert the rankings</b>? This will change the sorting order for everyone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 w-full mt-6">
              <Button onClick={() => setIsConfirmOpen(false)} variant="outline" className="bg-[#fbcfe8] text-[#9d174d] hover:bg-[#f9a8d4] font-bold rounded-xl h-12 text-lg border-none cursor-pointer">
                Cancel
              </Button>
              <Button onClick={executeInversion} className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl h-12 text-lg cursor-pointer">
                Confirm
              </Button>
          </div>
        </DialogContent>
      </Dialog>

    <div 
        onClick={handleInvertRanckings} 
        className={`border backdrop-blur-xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 p-2 rounded-md cursor-pointer flex items-center justify-center bg-gradient-to-r ${
            isInverted && type === 'negative'
            ? 'border-green-500/50 from-green-900/80 to-emerald-900/80' 
            : 'border-white/10 bg-zinc-900/70 from-gray-900 to-cyan-900'
        }`}
        title="Invert Rank"
    >   <span className="text-white text-sm"> Invert Rankings</span>
        <ArrowBigUp  className={`text-white transition-transform duration-300 ${isInverted === true ? "rotate-180" : ""}`} />
    </div>
    </>
  );
};
