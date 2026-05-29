import React from "react";

const MasterAdminContent = () => {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-6 space-y-4 md:w-1/2 w-full rounded-3xl border border-border bg-card backdrop-blur-xl shadow-lg text-foreground transition-all duration-300">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">About Club and Coach IDs</h2>
      <p className="text-sm text-muted-foreground font-semibold">
        <span className="border-b border-border text-primary text-[14px]">About Club ID</span>
        <br />
        Please set up a <span className="font-bold">CLUB ID</span>, so that your
        solutions are linked to your club and you can immediately (or at a later
        date) invite other administrators from the same or different sections of
        your club to help you run your section’s solutions or set up solutions
        for their own sections.
      </p>
      <p className="text-sm text-muted-foreground font-semibold">
        <span className="border-b text-primary border-border text-[14px]">About Coach ID and Section admin</span>
        <br />
        Coaches should use the Section ID to enable them to run different solutions for different groups of students they may be working either within the same institution or maybe at different institutions 
      </p>
    </div>
  );
};

export default MasterAdminContent;
