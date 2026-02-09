import React from "react";

const AdminImportantInfo = () => {
  return (
    <>
      <div className="space-y-3 w-full">
        <div className="flex justify-between items-center border-b border-black pb-1">
          <p className=" text-black font-semibold text-xs tracking-wider uppercase">
            This is your club’s administration dashboard.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-[13px] leading-relaxed text-slate-900">
            This area displays all the solutions that have been created by all
            the different section administrators.
          </p>

          <p className="text-[13px] leading-relaxed text-slate-900 ">
            <span>TO CREATE A SOLUTION:</span>
            <br />
            (1) Get a pin number from the main administrator. He creates them
            from the profile drop down menu.
            <br /> (2) Go to your section’s dashboard by selecting that option
            in the profile menu and enter your section pin number when requested{" "}
            <br /> (3) To edit a solution you have created, similarly, go to
            your section’s dashboard by selecting that option in the profile
            menu and enter your section pin number when requested.
          </p>

          <div className="bg-cyan-500/10 p-3 rounded-lg border border-black">
            <p className="text-[13px] leading-relaxed text-slate-900 font-medium">
              <span className="text-black italic">NOTE:</span> <br /> All solutions require a section pin number, so even
              the MAIN ADMINISTRATOR needs to set up a section pin in order to
              be able to create solutions
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminImportantInfo;
