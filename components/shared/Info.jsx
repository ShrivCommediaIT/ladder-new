

import Link from "next/link";
import React from "react";

const Info = () => {
  return (
    <div className="bg-blue-500 text-center rounded px-2">
      <p className="text-white">First time?</p>
      <Link
        href="/info-notes"
        className="text-white"
      >
        Info
      </Link>
    </div>
  );
};

export default Info;
