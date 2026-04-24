import React from "react";

const AdminHideShowInfo = ({ isModel }) => {
  const textColor = isModel ? "#00e5ff" : ""; // header color
  const normalText = isModel ? "text-white" : "text-slate-900";
  const headingText = isModel ? "text-white" : "text-black";
  const borderColor = isModel ? "border-white/20" : "border-black";
  const cardBg = isModel ? "bg-white/10 border-white/20" : "bg-cyan-500/10 border-black";

  return (
    <div className={`space-y-4 w-full ${normalText} text-[13px] leading-relaxed`}>

      {/* Header */}
      <div className={`flex justify-between items-center border-b pb-2 ${borderColor}`}>
        <p
          className="font-semibold text-xs tracking-wider uppercase"
          style={{ color: isModel ? textColor : "" }}
        >
          Getting Started
        </p>
      </div>

      {/* Step 1 */}
      <div>
        <p className={`font-semibold ${headingText}`}>1. Create Your Club ID</p>
        <p>
          Using an Excel CSV file with member’s names and phone numbers (phone numbers optional but can help members communicate more easily) 
          The roster not only lists your membership but also informs you and the members of their token totals and membership status.  You can add or remove members at any time.
        </p>
      </div>

      {/* Step 2 */}

      <div>
        <p className={`font-semibold ${headingText}`}>2. Create your Club Roster</p>
        <p>
          This is essential for the recording of participation tokens and communications via the app
        </p>
      </div>
      
      <div>
        <p className={`font-semibold ${headingText}`}>3. Create a Sport Section</p>
        <p>
          Add your first sport section and assign a Section PIN from the same
          drop-down menu.
        </p>
      </div>

      {/* Step 3 */}
      <div>
        <p>Log out of the Main Dashboard and log back in using:</p>
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li>Your Club ID</li>
          <li>The Section PIN</li>
          <li>Select Section Admin</li>
        </ul>
        <p className="mt-2">
          You will now be in that section’s dashboard, where you can create
          competitions specifically for that sport.
        </p>
        <p className="mt-1">
          You can repeat this process to create multiple sections for
          different sports.
        </p>
      </div>

      {isModel && (
        <div>
          <p className={`font-semibold ${headingText}`}>
            5. Explore the Demo
          </p>
          <p>
            You can try out the demo environment to understand how the system works
            before setting up your own data. This helps you get familiar with the
            dashboard, features, and overall flow.
          </p>
        </div>
      )}

      {/* All Competitions */}
      <div className={`p-3 rounded-lg border ${cardBg}`}>
        <p className={`font-semibold ${headingText}`}>All Competitions</p>
        <p>
          Every competition created by a section will automatically appear on
          the Main Admin Dashboard for central oversight and quick management
          when required.
        </p>
      </div>
    </div>
  );
};

export default AdminHideShowInfo;