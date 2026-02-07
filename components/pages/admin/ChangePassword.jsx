// "use client";
// import { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent } from "@/components/ui/card";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// import { useDispatch, useSelector } from "react-redux";
// // import {
// //   changePassword,
// //   resetChangePasswordState,
// // } from "@/redux/slices/changePasswordSlice";

// import { changePassword , resetChangePasswordState} from "@/redux/slices/changePassword";

// const ChangePassword = ({ userId }) => {
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");

//   const dispatch = useDispatch();
//   const { loading, success, error, message } = useSelector(
//     (state) => state.changePassword
//   );

//   const handleChange = () => {
//     if (!oldPassword || !newPassword) {
//       toast.error("Both fields are required!");
//       return;
//     }

//     dispatch(changePassword({ id: userId, old_password: oldPassword, password: newPassword }));

//   };

//   useEffect(() => {
//     if (success) {
//       toast.success(message || "Password changed successfully!");
//       setOldPassword("");
//       setNewPassword("");
//       dispatch(resetChangePasswordState());
//     }
//     if (error) {
//       toast.error(typeof error === "string" ? error : "Failed to change password");
//       dispatch(resetChangePasswordState());
//     }
//   }, [success, error, message, dispatch]);

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
//       <ToastContainer />
//       <Card className="w-[380px] shadow-lg rounded-2xl">
//         <CardContent className="p-6 space-y-4">
//           <h2 className="text-2xl font-bold text-blue-600 text-center mb-4">
//             Change Password
//           </h2>

//           <div>
//             <Label htmlFor="oldPassword" className="text-blue-600 font-semibold">
//               Old Password
//             </Label>
//             <Input
//               id="oldPassword"
//               type="password"
//               value={oldPassword}
//               onChange={(e) => setOldPassword(e.target.value)}
//               placeholder="Enter your old password"
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
//             onClick={handleChange}
//             disabled={loading}
//           >
//             {loading ? "Changing..." : "Change Password"}
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default ChangePassword;






// =======================


"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useDispatch, useSelector } from "react-redux";
import { changePassword, resetChangePasswordState } from "@/redux/slices/changePassword";

const ChangePassword = ({ userId }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const dispatch = useDispatch();
  const { loading, success, error, message } = useSelector(
    (state) => state.changePassword
  );

  const handleChange = () => {
    if (!oldPassword || !newPassword) {
      toast.error("Both fields are required!");
      return;
    }

    dispatch(changePassword({ id: userId, old_password: oldPassword, password: newPassword }));
  };

  useEffect(() => {
    if (success) {
      setOldPassword("");
      setNewPassword("");
      dispatch(resetChangePasswordState());
      toast.success("Password changed successfully!");
      
    }
    if (error) {
      toast.error(typeof error === "string" ? error : "Failed to change password");
      dispatch(resetChangePasswordState());
    }
  }, [error, message, dispatch]);

  return (
    <div className="space-y-4">
      <ToastContainer />
      <div>
        <Label htmlFor="oldPassword" className="text-blue-600 font-semibold">
          Old Password
        </Label>
        <Input
          id="oldPassword"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          placeholder="Enter your old password"
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
        onClick={handleChange}
        disabled={loading}
      >
        {loading ? "Changing..." : "Change Password"}
      </Button>
    </div>
  );
};

export default ChangePassword;
