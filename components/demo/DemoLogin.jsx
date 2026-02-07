
//   "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent } from "@/components/ui/card";
// import { ToastContainer, toast } from "react-toastify";
// import { FaArrowRightLong } from "react-icons/fa6";
// import { Eye, EyeOff } from "lucide-react";
// import Link from "next/link";
// import "react-toastify/dist/ReactToastify.css";

// // Redux
// import { useDispatch, useSelector } from "react-redux";
// import { loginUser, resetUserState } from "@/redux/slices/userSlice";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import DemoLadders from "./DemoLadders";

// export default function DemoLogin({ ladderId }) {
//   const [username, setUsername] = useState("joebloggs@gmail.com");
//   const [password, setPassword] = useState("111");
//   const [showPassword, setShowPassword] = useState(false);
//   const [decodedLadderId, setDecodedLadderId] = useState(ladderId || null);
//   const [isLoggingIn, setIsLoggingIn] = useState(false); // login state

//   const [forgotEmail, setForgotEmail] = useState("");
//   const [isForgotOpen, setIsForgotOpen] = useState(false);

//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { loading, error, isFreePlanExpired } = useSelector(
//     (state) => state.user
//   );

//   const searchParams = useSearchParams();
//   const autoLogin = searchParams.get("autoLogin");
//   const encodedFromQuery = searchParams.get("id");

//   // Decode ladder ID from query if needed
//   useEffect(() => {
//     if (!decodedLadderId && encodedFromQuery) {
//       try {
//         const decoded = atob(decodeURIComponent(encodedFromQuery));
//         setDecodedLadderId(decoded);
//         console.log("Decoded ladder ID:", decoded);
//       } catch (e) {
//         console.error("Invalid encoded ladder ID", e);
//       }
//     }
//   }, [encodedFromQuery, decodedLadderId]);

//   // Auto-login effect
//   useEffect(() => {
//     if (autoLogin === "true") {
//       handleLogin();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [autoLogin]);

//   // Show toast if redirected from registration
//   useEffect(() => {
//     if (searchParams.get("from") === "ladder") {
//       toast.info(
//         "Use the same exact details you used to create your account.",
//         { autoClose: 5000 }
//       );
//     }
//   }, [searchParams]);

//   const handleLogin = async () => {
//     setIsLoggingIn(true); // hide UI

//     if (!username || !password) {
//       toast.error("Username and Password are required!");
//       setIsLoggingIn(false);
//       return;
//     }

//     const payload = {
//       user_id: username,
//       password,
//       user_type: "user",
//       ladder_id: decodedLadderId || 1,
//     };

//     try {
//       const res = await dispatch(loginUser(payload)).unwrap();
//       const userData = res?.data;

//       if (!userData || !userData.id) {
//         toast.error("Currently Your Account is InActive.");
//         setIsLoggingIn(false);
//         return;
//       }

//       toast.success("Login successful!");
//       router.push("/user-page-redirect"); // redirect after login
//     } catch (err) {
//       console.error("Login Error:", err.message);
//       toast.error("Login failed. Please check your credentials.");
//       setIsLoggingIn(false);
//     }
//   };

//   const handleForgotPassword = () => {
//     if (!forgotEmail) {
//       toast.error("Please enter your email!");
//       return;
//     }
//     toast.success("Password reset link sent to " + forgotEmail);
//     setIsForgotOpen(false);
//     setForgotEmail("");
//   };

//   useEffect(() => {
//     if (error) {
//       dispatch(resetUserState());
//     }
//   }, [error, dispatch]);

//   // ✅ Hide UI if logging in
//   if (isLoggingIn || autoLogin === "true") {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
//         <p className="text-blue-700 font-bold text-lg">Logging you in...</p>
//       </div>
//     );
//   }

//   // Normal login form
//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 px-4">
//       <ToastContainer />
//       <Card className="w-full max-w-sm shadow-lg rounded-2xl">
//         <CardContent className="p-6">
//           <h2 className="text-2xl font-bold text-center text-transparent bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text mb-6">
//             Login Ladder
//           </h2>

//           <div className="mb-4">
//             <Label htmlFor="username" className="text-blue-600 py-2 font-semibold text-lg">
//               Username/Email
//             </Label>
//             <Input
//               id="username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               placeholder="Enter your email address"
//             />
//           </div>

//           <div className="mb-4 relative">
//             <Label htmlFor="password" className="text-blue-600 py-2 font-semibold text-lg">
//               Password
//             </Label>
//             <Input
//               id="password"
//               type={showPassword ? "text" : "password"}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="Enter your password"
//               className="pr-10"
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-[52px] text-gray-500 hover:text-gray-700"
//             >
//               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
//           </div>

//           <Button
//             className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 font-semibold flex items-center justify-center gap-2"
//             onClick={handleLogin}
//             disabled={loading}
//           >
//             {loading ? "Logging in..." : "Login"}
//             {!loading && <FaArrowRightLong />}
//           </Button>

//           <div className="mt-4 text-sm text-center">
//             <p>
//               Don&apos;t have an account?{" "}
//               <Link
//                 href={`/register-user${decodedLadderId ? `/${encodeURIComponent(btoa(decodedLadderId))}` : ""}`}
//                 className="text-blue-600 underline"
//               >
//                 Register here
//               </Link>
//             </p>

//             <div className="py-2">
//               <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
//                 <DialogTrigger asChild>
//                   <button className="text-purple-600 underline">Forgot Password?</button>
//                 </DialogTrigger>
//                 <DialogContent className="sm:max-w-md">
//                   <DialogHeader>
//                     <DialogTitle>Reset Password</DialogTitle>
//                   </DialogHeader>
//                   <div className="space-y-4">
//                     <Label htmlFor="forgotEmail">Enter your email</Label>
//                     <Input
//                       id="forgotEmail"
//                       placeholder="example@email.com"
//                       value={forgotEmail}
//                       onChange={(e) => setForgotEmail(e.target.value)}
//                     />
//                   </div>
//                   <DialogFooter className="mt-4">
//                     <Button className="bg-blue-500 text-white" onClick={handleForgotPassword}>
//                       Send Reset Link
//                     </Button>
//                   </DialogFooter>
//                 </DialogContent>
//               </Dialog>
//             </div>
//           </div>

//           {isFreePlanExpired && (
//             <p className="mt-4 text-sm text-red-600 text-center">
//               Your free plan has expired. Please upgrade to continue.
//             </p>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

 










// =========================== 18-12-2025 ====================
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import { FaArrowRightLong } from "react-icons/fa6";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { loginUser, resetUserState } from "@/redux/slices/userSlice";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DemoLogin({ ladderId }) {
  const [username, setUsername] = useState("joebloggs@gmail.com");
  const [password, setPassword] = useState("111");
  const [showPassword, setShowPassword] = useState(false);
  const [decodedLadderId, setDecodedLadderId] = useState(ladderId || null);
  const [decodedLadderType, setDecodedLadderType] = useState(null); // ✅ NEW
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const { loading, error, isFreePlanExpired } = useSelector(
    (state) => state.user
  );

  const searchParams = useSearchParams();
  const autoLogin = searchParams.get("autoLogin");
  const encodedFromQuery = searchParams.get("id");
  const encodedLadderTypeFromQuery = searchParams.get("type"); // ✅ NEW

  // ✅ Decode ladder ID & ladderType from query
  useEffect(() => {
    if (!decodedLadderId && encodedFromQuery) {
      try {
        const decoded = atob(decodeURIComponent(encodedFromQuery));
        setDecodedLadderId(decoded);
        console.log("Decoded ladder ID:", decoded);
      } catch (e) {
        console.error("Invalid encoded ladder ID", e);
      }
    }
  }, [encodedFromQuery, decodedLadderId]);

  // ✅ Decode ladderType from query
  useEffect(() => {
    if (!decodedLadderType && encodedLadderTypeFromQuery) {
      try {
        const decodedType = atob(decodeURIComponent(encodedLadderTypeFromQuery));
        setDecodedLadderType(decodedType);
        console.log("Decoded ladder Type:", decodedType);
      } catch (e) {
        console.error("Invalid encoded ladder Type", e);
      }
    }
  }, [encodedLadderTypeFromQuery, decodedLadderType]);

  // Auto-login effect
  useEffect(() => {
    if (autoLogin === "true") {
      handleLogin();
    }
  }, [autoLogin]);

  // Show toast if redirected from registration
  useEffect(() => {
    if (searchParams.get("from") === "ladder") {
      toast.info(
        "Use the same exact details you used to create your account.",
        { autoClose: 5000 }
      );
    }
  }, [searchParams]);

  const handleLogin = async () => {
    setIsLoggingIn(true);

    if (!username || !password) {
      toast.error("Username and Password are required!");
      setIsLoggingIn(false);
      return;
    }

    const payload = {
      user_id: username,
      password,
      user_type: "user",
      ladder_id: decodedLadderId || 1,
      type: decodedLadderType || "winlose", // ✅ Added ladderType
    };

    try {
      const res = await dispatch(loginUser(payload)).unwrap();
      const userData = res?.data;

      if (!userData || !userData.id) {
        toast.error("Currently Your Account is InActive.");
        setIsLoggingIn(false);
        return;
      }

      toast.success("Login successful!");
      router.push("/user-page-redirect");
    } catch (err) {
      console.error("Login Error:", err.message);
      toast.error("Login failed. Please check your credentials.");
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = () => {
    if (!forgotEmail) {
      toast.error("Please enter your email!");
      return;
    }
    toast.success("Password reset link sent to " + forgotEmail);
    setIsForgotOpen(false);
    setForgotEmail("");
  };

  useEffect(() => {
    if (error) {
      dispatch(resetUserState());
    }
  }, [error, dispatch]);

  if (isLoggingIn || autoLogin === "true") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
        <p className="text-blue-700 font-bold text-lg">Logging you in...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 px-4">
      <ToastContainer />
      <Card className="w-full max-w-sm shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-center text-transparent bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text mb-6">
            Login Ladder
          </h2>

          <div className="mb-4">
            <Label htmlFor="username" className="text-blue-600 py-2 font-semibold text-lg">
              Username/Email
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your email address"
            />
          </div>

          <div className="mb-4 relative">
            <Label htmlFor="password" className="text-blue-600 py-2 font-semibold text-lg">
              Password
            </Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[52px] text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 font-semibold flex items-center justify-center gap-2"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
            {!loading && <FaArrowRightLong />}
          </Button>

          <div className="mt-4 text-sm text-center">
            <p>
              Don't have an account?{" "}
              <Link
                href={`/register-user${decodedLadderId ? `/${encodeURIComponent(btoa(decodedLadderId))}` : ""}`}
                className="text-blue-600 underline"
              >
                Register here
              </Link>
            </p>

            <div className="py-2">
              <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
                <DialogTrigger asChild>
                  <button className="text-purple-600 underline">Forgot Password?</button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Label htmlFor="forgotEmail">Enter your email</Label>
                    <Input
                      id="forgotEmail"
                      placeholder="example@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                  <DialogFooter className="mt-4">
                    <Button className="bg-blue-500 text-white" onClick={handleForgotPassword}>
                      Send Reset Link
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {isFreePlanExpired && (
            <p className="mt-4 text-sm text-red-600 text-center">
              Your free plan has expired. Please upgrade to continue.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
