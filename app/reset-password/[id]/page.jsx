
// import ResetPassword from "@/components/pages/admin/ResetPassword";
// import { useSearchParams } from "next/navigation";

//  const ResetPasswordForm = () => {
//   const param = useSearchParams.get("id")
//   return <ResetPassword param={param} />;
// };

// export default ResetPasswordForm




// =====================

// "use client";

// import ResetPassword from "@/components/pages/admin/ResetPassword";
// import { useSearchParams } from "next/navigation";

// const ResetPasswordForm = () => {
//   const searchParams = useSearchParams(); // ✅ hook call
//   const id = searchParams.get("id"); // ✅ ab get call kar sakte ho

//   return <ResetPassword param={id} />;
// };

// export default ResetPasswordForm;








"use client";

import ResetPassword from "@/components/pages/admin/ResetPassword";
import { useParams } from "next/navigation";

const ResetPasswordForm = () => {
  const { id } = useParams(); // ✅ yeh URL ka path param dega (2089)

  return <ResetPassword param={id} />;
};

export default ResetPasswordForm;
