import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'next/navigation';

// Actions from different slices
import { fetchNegativeLeaderboard } from '@/redux/slices/negativeLeaderBoardSlice';
import { fetchPositiveLeaderboard } from '@/redux/slices/positiveLeaderBoardSlice';
import { fetchSkillLeaderboard } from '@/redux/slices/BasicLeaderboardSlice';
import { fetchLeaderboard, toggleInvertRanking } from '@/redux/slices/leaderboardSlice';
import { fetchMiniLeague } from '@/redux/slices/minileagueSlice';
import { fetchRosterLeaderboard } from '@/redux/slices/rosterLeaderboardSlice';

import { ArrowDownUp } from 'lucide-react';

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
    const [order, setOrder] = useState("asc");

    const handleInvertRanckings = () => {
        const newOrder = order === "asc" ? "desc" : "asc";
        setOrder(newOrder);

        // 1. Sync global Redux invert state
        dispatch(toggleInvertRanking());

        // 2. Prepare parameters 
        const params = Object.fromEntries(searchParams.entries());
        params.orderBy = newOrder;

        // Get and Normalize type from URL
        const rawType = (params.ladder_type || params.type || "");
        const canonicalType = normalizeType(rawType);
        
        // Update params with the canonical type for the API call
        params.type = canonicalType;

        console.log("Inverting Ranking (Normalized):", { original: rawType, canonical: canonicalType, orderBy: newOrder });

        // 3. Dispatch to the specific slice that the page component is actually listening to
        switch (canonicalType) {
            case "negative":
                dispatch(fetchNegativeLeaderboard(params));
                break;
            case "positive":
                dispatch(fetchPositiveLeaderboard(params));
                break;
            case "minileague":
                dispatch(fetchMiniLeague(params));
                break;
            case "roster":
                dispatch(fetchRosterLeaderboard(params));
                break;
            case "winlose":
            case "best3":
            case "best5":
                // These pages (Best5Players) listen to state.player/leaderboardSlice 
                dispatch(fetchLeaderboard(params));
                break;
            case "skill":
            default:
                // BasicLeaderboard listens to state.skillLeaderboard/BasicLeaderboardSlice
                dispatch(fetchSkillLeaderboard(params));
                break;
        }
    };
    
  return (
    <div 
        onClick={handleInvertRanckings} 
        className='border border-white/10 bg-zinc-900/70 backdrop-blur-xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 p-2 bg-gradient-to-r from-gray-900 to-cyan-900 rounded-md cursor-pointer flex items-center justify-center'
        title={`Sort ${order === 'asc' ? 'Descending' : 'Ascending'}`}
    >
        <ArrowDownUp className={`text-white transition-transform duration-300 ${order === "desc" ? "rotate-180" : ""}`} />
    </div>
  );
};
