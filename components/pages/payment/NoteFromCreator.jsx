import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const NoteFromCreator = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* <h1 className="text-3xl font-bold text-center mb-8">Note from the Creator</h1> */}
      <Card className="bg-white dark:bg-gray-900 rounded-none shadow-md border border-gray-300 dark:border-gray-700">
        <CardContent className="space-y-6 p-6 text-lg leading-relaxed">
          <h1 className="text-3xl font-bold text-center mb-8">Note from the Creator</h1>
          <p>
            We have spoken to many sports administrators, managers and organisers of sports competitions and they have collectively expressed a need for online systems to help create ladders and leaderboards to display and promote competition within clubs and leagues.
          </p>

          <Separator />

          <h2 className="text-2xl font-semibold">Ladders and Leaderboards for the Players by the Players – self running</h2>
          <p>
            The online sports ladders and leaderboards created here have been designed to function in such a way that the players can make all the necessary changes required to keep competition results up to date with minimum admin input which will be of great benefit to competition organisers. Basically, they run themselves.
          </p>

          <Separator />

          <h2 className="text-xl font-semibold">The ladders incorporate:</h2>
          <ul className="list-[roman] list-inside space-y-2">
            <li>The ability for admin to change all parameters and player details</li>
            <li>The ability for players to:
              <ul className="list-[lower-roman] list-inside ml-4 space-y-1">
                <li>individually change their positions on the board as they win matches</li>
                <li>Amend personal details</li>
                <li>discover other players’ contact details and challenge them</li>
                <li>Alter their status from “available” to “unavailable” – useful information</li>
                <li>Upload their personal avatars which truly personalises a Club Ladder making it look and feel really personal to the club.</li>
              </ul>
            </li>
            <li>A system that only allows players to move their own icon which prevents frivolous tampering</li>
            <li>A cross reference system that prevents “cheating” or accidental errors</li>
            <li>The ability for admin to break up the ladder into “sections” separating skill levels and increasing motivation for those within those skill level sections to compete to improve and climb up the “club ladder” and into better “Skill level Sections”.</li>
          </ul>

          <Separator />

          <h2 className="text-xl font-semibold">Other Benefits</h2>
          <ul className="list-[roman] list-inside space-y-2">
            <li>Enables club team captains to see who is available for their teams at the skill level they need and how they are performing at any given moment.</li>
            <li>Club team captains can use the ladder positions as a basis for selection which should prompt players keen to get into teams to compete regularly</li>
            <li>The above two, refer very much to lower ranked players as well as high ranked players, so promoting healthy competition at the lower skill levels of the club.</li>
            <li>Ladder positions can be used for the purposes of seeding for internal club championships and handicap tournament.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteFromCreator;
