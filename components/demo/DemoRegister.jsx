

"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, resetUserState } from "@/redux/slices/userSlice"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";


export default function DemoRegister({ ladderId, ladderType }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, successMessage } = useSelector((state) => state.user);

  const [formSubmitted, setFormSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    username: "joebloggs@gmail.com",
    password: "111",
    confirmPassword: "111",
    name: "Joe Bloggs",
    ladder_id: ladderId,
    type: ladderType
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ladder_id: ladderId,
    }));
  }, [ladderId]);

  useEffect(() => {
    dispatch(resetUserState());
  }, [dispatch]);

  // ✅ Auto-register on page load
  useEffect(() => {
    if (!formSubmitted) {
      handleRegister();  // page load होते ही call
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   if (formSubmitted && successMessage) {
  //     toast.success("Account created! Redirecting to login...");

  //     setTimeout(() => {
  //       const encodedId = formData.ladder_id ? btoa(formData.ladder_id) : null;
  //       const loginRedirectUrl = encodedId
  //         ? `/demo-login?id=${encodedId}&autoLogin=true`
  //         : "/demo-login?autoLogin=true";

  //       router.push(loginRedirectUrl);
  //     }, 1500);
  //   }

  //   if (formSubmitted && error) {
  //     toast.error(error);
  //     dispatch(resetUserState());
  //     setFormSubmitted(false);
  //   }
  // }, [successMessage, error, dispatch, router, formData, formSubmitted]);



// ✅ Update this useEffect in DemoRegister.jsx
useEffect(() => {
  if (formSubmitted && successMessage) {
    toast.success("Account created! Redirecting to login...");

    setTimeout(() => {
      const encodedId = formData.ladder_id ? btoa(formData.ladder_id) : null;
      const encodedType = formData.type ? btoa(formData.type) : null; // ✅ Added
      const loginRedirectUrl = encodedId && encodedType
        ? `/demo-login?id=${encodedId}&type=${encodedType}&autoLogin=true`
        : `/demo-login?autoLogin=true`;

      router.push(loginRedirectUrl);
    }, 1500);
  }

      if (formSubmitted && error) {
      toast.error(error);
      dispatch(resetUserState());
      setFormSubmitted(false);
    }

}, [successMessage, error, dispatch, router, formData, formSubmitted]);



  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegister = () => {
    const { username, password, confirmPassword, name, ladder_id, ladderType } = formData;

    if (!username || !password || !confirmPassword || !name) {
      toast.error("All fields are required!");
      return;
    }

    if (!emailRegex.test(username)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const payload = {
      user_id: username,
      password,
      name,
      user_type: "user",
      ladder_id: ladder_id,
      type: ladderType
    };

    setFormSubmitted(true);
    dispatch(registerUser(payload));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <ToastContainer />
      <Card className="w-[380px] shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-6">
            Sports Ladder
          </h2>
          <p className="text-center text-gray-600">Auto registering...</p>
        </CardContent>
      </Card>
    </div>
  );
}
