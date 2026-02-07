// "use client";
// import { useEffect } from "react";
// import { useDispatch } from "react-redux";

// export default function AppInit() {
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const userStr = localStorage.getItem("userData");

//     if (userStr) {
//       try {
//         const user = JSON.parse(userStr);
//         if (user && typeof user === "object") {
//           dispatch(setUser(user));
//         }
//       } catch (err) {
//         console.warn("Failed to parse userData from localStorage:", err);
//         localStorage.removeItem("userData"); // optional: clean invalid data
//       }
//     }
//   }, [dispatch]);

//   return null;
// }




import React from 'react'

const AppInit = () => {
  return (
    <div></div>
  )
}

export default AppInit