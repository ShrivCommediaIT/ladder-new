"use client";

import ResetPassword from "@/components/pages/admin/ResetPassword";
import { useParams } from "next/navigation";

const ResetPasswordForm = () => {
  const { id } = useParams(); // ✅ yeh URL ka path param dega (2089)

  return <ResetPassword param={id} />;
};

export default ResetPasswordForm;
