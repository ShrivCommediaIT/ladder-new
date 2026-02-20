import React from "react";

const AdminHideShowInfo = () => {
  return (
    <>
      <div className="space-y-4 w-full text-slate-900 text-[13px] leading-relaxed">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-black pb-2">
          <p className="text-black font-semibold text-xs tracking-wider uppercase">
            Getting Started
          </p>
        </div>

        {/* Step 1 */}
        <div>
          <p className="font-semibold text-black">1. Create Your Club ID</p>
          <p>
            From the Main Administrator drop-down menu, create your Club ID.
            You can change this later if needed.
          </p>
        </div>

        {/* Step 2 */}
        <div>
          <p className="font-semibold text-black">2. Create a Sport Section</p>
          <p>
            Add your first sport section and assign a Section PIN from the same
            drop-down menu.
          </p>
        </div>

        {/* Step 3 */}
        <div>
          <p className="font-semibold text-black">3. Log in as Section Admin</p>
          <p>Log out of the Main Dashboard and log back in using:</p>
          <ul className="list-disc ml-5 mt-1 space-y-1">
            <li>Your Club ID</li>
            <li>The Section PIN</li>
            <li>Select Section Admin</li>
          </ul>
          <p className="mt-2">
            You will now be in that section’s dashboard, where you can create
            solutions specifically for that sport.
          </p>
          <p className="mt-1">
            You can repeat this process to create multiple sections for
            different sports.
          </p>
        </div>

        {/* All Solutions Section */}
        <div className="bg-cyan-500/10 p-3 rounded-lg border border-black">
          <p className="font-semibold text-black">All Solutions</p>
          <p>
            Every solution created by a section will automatically appear on
            the Main Admin Dashboard for central oversight and quick management
            when required.
          </p>
        </div>

        {/* Go Live Section */}
        <div className="bg-amber-400/10 p-3 rounded-lg border border-black">
          <p className="font-semibold text-black">
            When You’re Ready to Go Live
          </p>
          <p>
            Delete the demo solutions once you no longer need them.
          </p>
        </div>

      </div>
    </>
  );
};

export default AdminHideShowInfo;