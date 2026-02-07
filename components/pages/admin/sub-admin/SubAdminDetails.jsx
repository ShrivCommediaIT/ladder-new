// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { LogOut, UserCircle2, Pencil } from "lucide-react";
// import { IoIosArrowDown } from "react-icons/io";
// import Logo from "@/public/logo.jpg";
// import axios from "axios";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// import { clubIdPage } from "@/helper/RouteName";

// const SubAdminDetails = () => {
//   const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

//   const router = useRouter();
//   const [user, setUser] = useState(null);
//   const [uploading, setUploading] = useState(false);

//   // ✅ Get user from localStorage
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const storedUser = localStorage.getItem("subAdmin");
//       if (storedUser) {
//         try {
//           setUser(JSON.parse(storedUser));
//         } catch (err) {
//           console.error("Invalid user in localStorage", err);
//           setUser(null);
//         }
//       }
//     }
//   }, []);

//   const handleImageChange = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!user?.id) {
//       alert("User id missing");
//       return;
//     }

//     console.log("Uploading file:", file);

//     const formData = new FormData();
//     formData.append("id", String(user.id));
//     formData.append("image", file);

//     setUploading(true);

//     try {
//       const res = await axios.post(
//         "https://ne-games.com/leaderBoard/api/app/user/updateSubadminimage",
//         formData,
//         {
//           headers: {
//             APPKEY: APPKEY,
//           },
//         },
//       );

//       console.log("UPLOAD RESPONSE:", res.data);

//       if (res.data.status == 200 || res.data.status === "success") {
//         // ⚠️ adjust based on actual response shape
//         const imageUrl =
//           res.data.image || res.data.data?.image || res.data.path;

//         if (imageUrl) {
//           const updated = { ...user, image: imageUrl };
//           localStorage.setItem("subAdmin", JSON.stringify(updated));
//           setUser(updated);
//         }

//         alert("Profile image updated ✅");
//       } else {
//         alert(res.data.message || "Upload failed");
//       }
//     } catch (err) {
//       console.log("UPLOAD ERROR:", err.response || err);
//       alert(err.response?.data?.message || "Upload error");
//     } finally {
//       setUploading(false);
//     }
//   };

//   // Logout → always go to Club ID page
//   const handleLogout = () => {
//     // Clear storage
//     localStorage.removeItem("admin");
//     localStorage.removeItem("subAdmin");
//     localStorage.removeItem("userData");
//     localStorage.removeItem("persist:root");
//     sessionStorage.clear();

//     // Redirect to club id login page
//     router.push(clubIdPage);
//   };

//   return (
//     <div className="w-full">
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <div className="flex justify-end items-center space-x-3 cursor-pointer rounded-md px-3 py-2 transition hover:bg-zinc-800">
//             {/* <Image
//               src={Logo}
//               alt="User"
//               width={32}
//               height={32}
//               className="rounded-full border w-8 h-8 object-cover"
//             /> */}
//             <label className="relative cursor-pointer group">
//               {/* profile image */}
//               <div className="relative w-8 h-8 overflow-hidden rounded-full border transition-all duration-200 group-hover:scale-125">
//                 <Image
//                   src={user?.image || Logo}
//                   alt="User"
//                   fill
//                   className="object-cover"
//                 />

//                 {/* overlay */}
//                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
//                   <Pencil className="w-4 h-4 text-white" />
//                 </div>
//               </div>

//               {/* hidden file input */}
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 disabled={uploading}
//                 onChange={handleImageChange}
//               />
//             </label>

//             <div className="hidden sm:flex flex-col">
//               <span className="text-sm font-semibold text-zinc-100 capitalize">
//                 {user?.name || "Guest"}
//               </span>
//               <span className="text-xs text-zinc-300">Profile</span>
//             </div>
//             <IoIosArrowDown size={18} className="text-zinc-600" />
//           </div>
//         </DropdownMenuTrigger>

//         <DropdownMenuContent className="w-52 mt-2" align="end">
//           <DropdownMenuLabel className="flex items-center gap-2 text-zinc-700">
//             <UserCircle2 className="w-4 h-4" />
//             {user?.name || "Guest"}
//           </DropdownMenuLabel>

//           <DropdownMenuItem
//             onClick={handleLogout}
//             className="text-red-600 cursor-pointer hover:bg-red-50"
//           >
//             <LogOut className="mr-2 h-4 w-4" />
//             Logout
//           </DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>
//     </div>
//   );
// };

// export default SubAdminDetails;













// =========================================================

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, UserCircle2, Pencil } from "lucide-react";
import { IoIosArrowDown } from "react-icons/io";
import Logo from "@/public/logo.jpg";
import axios from "axios";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { clubIdPage } from "@/helper/RouteName";

const SubAdminDetails = () => {
  const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

  const router = useRouter();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("subAdmin");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (err) {
          console.error("Invalid user in localStorage", err);
          setUser(null);
        }
      }
    }
  }, []);

  // ✅ Helper function to validate image source
  const getImageSrc = () => {
    if (user?.image && typeof user.image === "string" && user.image.trim() !== "") {
      return user.image;
    }
    return Logo;
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      alert("User id missing");
      return;
    }

    const formData = new FormData();
    formData.append("id", String(user.id));
    formData.append("image", file);

    setUploading(true);

    try {
      const res = await axios.post(
        "https://ne-games.com/leaderBoard/api/app/user/updateSubadminimage",
        formData,
        {
          headers: { APPKEY: APPKEY },
        }
      );

      if (res.data.status == 200 || res.data.status === "success") {
        const imageUrl = res.data.image || res.data.data?.image || res.data.path;
        if (imageUrl) {
          const updated = { ...user, image: imageUrl };
          localStorage.setItem("subAdmin", JSON.stringify(updated));
          setUser(updated);
        }
        alert("Profile image updated ✅");
      } else {
        alert(res.data.message || "Upload failed");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("subAdmin");
    localStorage.removeItem("userData");
    localStorage.removeItem("persist:root");
    sessionStorage.clear();
    router.push(clubIdPage);
  };

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end items-center space-x-3 cursor-pointer rounded-md px-3 py-2 transition hover:bg-zinc-800">
            <label className="relative cursor-pointer group">
              <div className="relative w-8 h-8 overflow-hidden rounded-full border transition-all duration-200 group-hover:scale-125 bg-zinc-700">
                <Image
                  src={getImageSrc()}
                  alt="User"
                  fill
                  unoptimized={true} // ✅ Prevents Next.js from failing on external/dynamic URLs
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <Pencil className="w-3 h-3 text-white" />
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleImageChange}
              />
            </label>

            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-semibold text-zinc-100 capitalize">
                {user?.name || "Guest"}
              </span>
              <span className="text-xs text-zinc-300">Profile</span>
            </div>
            <IoIosArrowDown size={18} className="text-zinc-600" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-52 mt-2" align="end">
          <DropdownMenuLabel className="flex items-center gap-2 text-zinc-700">
            <UserCircle2 className="w-4 h-4" />
            {user?.name || "Guest"}
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 cursor-pointer hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SubAdminDetails;