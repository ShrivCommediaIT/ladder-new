"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const InfoNotes = () => {
  const router = useRouter();

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('./bgHome.png')" }}
    >
      {/* Overlay for fade effect */}
      <div className="absolute inset-0 bg-white/70"></div>

      {/* Content Layer */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 text-justify">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="outline"
            size="sm"
            className="sm:size-default cursor-pointer"
            onClick={() => router.back()}
          >
            ← Back
          </Button>
        </div>

        {/* Heading */}
        <h2 className="text-center text-lg sm:text-xl md:text-2xl font-extrabold text-pink-900 tracking-tight leading-snug">
          INFO FOR FIRST TIME USERS
        </h2>

        {/* Main Info Box */}
        <div className="font-medium mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          <ol className="space-y-2 sm:space-y-3 list-decimal list-inside">
            <li>
              Register, making sure that the email address you put in is that
              registered with the club admin. If you use a different one, you
              will not access the ladder.
            </li>
            <li>
      
              Log in to the ladder
            </li>
            <li>
              To view just the ladder, have “Ladder View ON” – to view the rules
              and activity log as well, have the “Ladder View OFF”.
            </li>
            <li>
          
              When logged in, an “ACTION BOX” will pop up which enables you to
              update results change your status, edit your details, upload your
              avatar, see your playing stats and obtain players’ contact
              details.
            </li>
          </ol>

          {/* Nested List */}
          <ul className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
        

            <h1 className="bg-yellow-300 w-56 p-2 rounded font-semibold">
              IN THE ACTION BOX :
            </h1>

            <li>
              <span className="bg-yellow-300 px-2 py-1 rounded text-sm sm:text-base">
                USE RESULT
              </span>{" "}
              to upload the result of your match – first select the “beat” or
              “lost to” box, then enter your opponent’s rank and click on “Post
              Result”. This updates the ladder in real time. A confirmation
              email is sent to your opponent and the result is displayed in the
              “Activity Section”.
            </li>
            <li>
              <span className="bg-yellow-300 px-2 py-1 rounded text-sm sm:text-base">
                USE EDIT STATUS
              </span>{" "}
              to edit your status – choose between “available” and
              “unavailable”. This is designed to inform all players of any “long
              term” unavailability due to injury, holiday, working away or
              sickness.
            </li>
            <li>
              <span className="bg-yellow-300 px-2 py-1 rounded text-sm sm:text-base">
                USE EDIT DETAILS
              </span>{" "}
              to make sure your details are correct and as you want them (name
              and phone number).
            </li>
            <li>
              <span className="bg-yellow-300 px-2 py-1 rounded text-sm sm:text-base">
                USE UPLOAD
              </span>{" "}
              to upload your avatar. Please do so as it very much personalises
              the look of the ladder.
            </li>
            <li>
              <span className="bg-yellow-300 px-2 py-1 rounded text-sm sm:text-base">
                USE STATS
              </span>{" "}
              to see your personalised player stats and how they rank.
            </li>

            <li>
              <span className="bg-yellow-300 px-2 py-1 rounded text-sm sm:text-base">
                USE CHALLENGE
              </span>{" "}
              to obtain the contact details of other players. You can copy those
              details and paste into the comms app of your choice.
            </li>
          </ul>

          {/* Extra Notes */}
          <div className="space-y-2 sm:space-y-3">
            <p>
              <span className="bg-yellow-300 px-2 py-1 rounded text-sm sm:text-base">
                RULES
              </span> {" "}
              check the RULES of CHALLENGING as that limits who you are allowed
              to challenge.
            </p>
            <p>
              <span className="bg-yellow-300 px-2 py-1 rounded text-sm sm:text-base">
                ACTIVITY
              </span>{" "}
              All results are listed for your information
            </p>
            <p className="space-y-4">
              <span className="bg-yellow-300 px-2 py-1 rounded text-sm sm:text-base">
                ADMIN
              </span>{" "}
              <br /> (i) if you have any problems using the ladder, please
              contact admin with the info shown. <br /> (ii) Admin has the ability to
              move, add or remove players if it sees fit. <br />
              (iii) All new players to the ladder are placed at the bottom of the ladder BUT may challenge anyone they wish to quickly get into the correct mini-league for them. Players above them are asked to accept these challenges to facilitate the general integrity of the ladder and minimise mismatches.  
            </p>
          </div>

          {/* Closing Line */}
          <p className="text-center text-pink-900 text-base sm:text-lg mt-4">
            😊{" "}
            <span className="underline decoration-pink-600 decoration-2">
              IT’S YOUR LADDER – LOOK AFTER IT AND ENJOY 
            </span>{" "}
            😊
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoNotes;
