// "use client"

// import AdminPage from '@/components/pages/admin/AdminPage'
// import UserDetails from '@/components/shared/UserDetails'
// import React from 'react'
// import { useSelector } from 'react-redux'



// const AdminPageRouter = () => {

//   const user = useSelector((state)=> state.user?.user?.ladder_id)

//   return (
//     <div className=''>
     
//         <div>
//           <AdminPage ladder_id={user} />
          
//         </div>
//     </div>
//   )
// }

// export default AdminPageRouter













// =============================== Protected Route Example ===============================

"use client";

import AdminPage from "@/components/pages/admin/AdminPage";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import useAuthGuard from "@/hooks/useAuthGuard";

const AdminPageRouter = () => {

  const ladderId = useSelector((state) => state.user?.user?.ladder_id);

    // ... Protected Route ...
    const allowed = useAuthGuard();
    if (!allowed) return null;

  return (
    <div>
      <AdminPage ladder_id={ladderId} />
    </div>
  );
};

export default AdminPageRouter;