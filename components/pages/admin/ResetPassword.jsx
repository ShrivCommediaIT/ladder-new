

// "use client";
// import { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent } from "@/components/ui/card";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// // Redux
// import { useDispatch, useSelector } from "react-redux";
// import {
//   resetPassword,
//   resetResetPasswordState,
// } from "@/redux/slices/resetPasswordSlice";
// import { useRouter } from "next/navigation";
// // import { loginPage } from "@/helper/RouteName";

// const ResetPassword = ({ param }) => {
//   const [email, setEmail] = useState("");
//   const [newPassword, setNewPassword] = useState("");

//   const router = useRouter()

//   const dispatch = useDispatch();

//   const { loading, success, error, message } = useSelector(
//     (state) => state.resetPassword
//   );

//   const handleReset = () => {
//     if (!email || !newPassword) {
//       toast.error("Email and New Password are required!");
//       return;
//     }

//     dispatch(resetPassword({ email, password: newPassword, id: param }));
    
//   };

//   useEffect(() => {
//     if (success) {
//       toast.success("Password reset successful!");
//       setEmail("");
//       setNewPassword("");
//       dispatch(resetResetPasswordState());
      
//       window.location.href = "https://sportssolutionspro.com/login-page";
    
//     }
//     if (error) {
//       toast.error(typeof error === "string" ? error : "Failed to reset password");
//       dispatch(resetResetPasswordState());
//     }
//   }, [success, error, message, dispatch]);

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
//       <ToastContainer />
//       <Card className="w-[380px] shadow-lg rounded-2xl">
//         <CardContent className="p-6 space-y-4">
//           <h2 className="text-2xl font-bold text-blue-600 text-center mb-4">
//             Reset Password
//           </h2>

//           <div>
//             <Label htmlFor="email" className="text-blue-600 font-semibold">
//               Email
//             </Label>
//             <Input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter your email"
//             />
//           </div>

//           <div>
//             <Label htmlFor="newPassword" className="text-blue-600 font-semibold">
//               New Password
//             </Label>
//             <Input
//               id="newPassword"
//               type="password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               placeholder="Enter your new password"
//             />
//           </div>

//           <Button
//             className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 font-semibold"
//             onClick={handleReset}
//             disabled={loading}
//           >
//             {loading ? "Resetting..." : "Reset Password"}
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default ResetPassword;











// ============================

"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Redux
import { useDispatch, useSelector } from "react-redux";
import {
  resetPassword,
  resetResetPasswordState,
} from "@/redux/slices/resetPasswordSlice";

const ResetPassword = ({ param }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const dispatch = useDispatch();

  const { loading, success, error } = useSelector(
    (state) => state.resetPassword
  );

  const handleReset = () => {
    if (!email || !newPassword) {
      toast.error("Email and New Password are required!");
      return;
    }

    dispatch(resetPassword({ email, password: newPassword, id: param }));
  };

  useEffect(() => {
    if (success) {
      toast.success("Password reset successful!");
      setEmail("");
      setNewPassword("");
      dispatch(resetResetPasswordState());

      // ✅ Wait 1.5 sec so toast can be seen, then redirect
      setTimeout(() => {
        window.location.href = "https://sportssolutionspro.com/login-page";
      }, 1500);
    }

    if (error) {
      toast.error(typeof error === "string" ? error : "Failed to reset password");
      dispatch(resetResetPasswordState());
    }
  }, [success, error, dispatch]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <ToastContainer />
      <Card className="w-[380px] shadow-lg rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-blue-600 text-center mb-4">
            Reset Password
          </h2>

          <div>
            <Label htmlFor="email" className="text-blue-600 font-semibold">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <Label htmlFor="newPassword" className="text-blue-600 font-semibold">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
            />
          </div>

          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 font-semibold"
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
