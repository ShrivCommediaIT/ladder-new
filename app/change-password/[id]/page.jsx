// import ChangePassword from "@/components/pages/admin/ChangePassword";

// const changePasswordPage = ()=>{

//     return (
//         <div>
//             <ChangePassword/>
//         </div>
//     )
// }


// export default changePasswordPage;





// ======================

"use client";

import ChangePassword from "@/components/pages/admin/ChangePassword";
import { useParams, useRouter } from "next/navigation";

const ChangePasswordForm = () => {
  const { id } = useParams(); // dynamic user id from URL
  const router = useRouter();

  // Redirect if id is missing
  if (!id) {
    router.push("/login-page"); // or any fallback page
    return null;
  }

  return <ChangePassword userId={id} />;
};

export default ChangePasswordForm;
