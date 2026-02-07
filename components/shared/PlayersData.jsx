"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PlayerCard from "./PlayerCard";
import axios from 'axios'

const players = [
  { name: "Maya", phone: "09812356765", rank: 1 },
  { name: "Aman Verma", phone: "98456789015", rank: 2 },
  { name: "Simran Kaur", phone: "98111222331", rank: 3 },
  { name: "Rahul Sharma", phone: "98234567891", rank: 4 },
  { name: "Priya Singh", phone: "98345678902", rank: 5 },
  { name: "Neha Joshi", phone: "98567890129", rank: 6 },
  { name: "Arjun Mehra", phone: "98765432101", rank: 7 },
  { name: "Deepak Yadav", phone: "98678901231", rank: 8 },
  { name: "Shruti Jain", phone: "98789901234", rank: 9 },
  { name: "Manish Gupta", phone: "98892012345", rank: 10 },
];

export default function PlayersData() {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter players based on search input
  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="Search player by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <Badge className="bg-orange-500 rounded-none py-2 px-8 text-md font-semibold">
          GRADE A
        </Badge>
        <Badge className="bg-green-300 text-black rounded-none py-2 px-8 text-md font-semibold">
          Available
        </Badge>
        <Badge className="bg-blue-200 text-black rounded-none py-2 px-8 text-md font-semibold">
          Unavailable
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => (
            <PlayerCard
              key={player.rank}
              name={player.name}
              phone={player.phone}
              rank={player.rank}
            />
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">
            No players found
          </p>
        )}
      </div>
    </div>
  );
}