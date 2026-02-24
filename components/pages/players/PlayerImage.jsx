
//   "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   uploadProfileImage,
//   resetProfileImageState,
// } from "@/redux/slices/profileImageSlice";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import Image from "next/image";
// import Cropper from "react-easy-crop";
// import defaultAvatar from "@/public/logo.jpg";

// const PlayerImage = ({ userId, onClose = () => {} }) => {
//   const dispatch = useDispatch();
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [cropping, setCropping] = useState(false);
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);
//   const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

//   const { loading, success, error } = useSelector(
//     (state) => state.profileImage
//   );

//   useEffect(() => {
//     return () => {
//       dispatch(resetProfileImageState());
//     };
//   }, [dispatch]);

//   // Auto-close modal after successful upload
//   useEffect(() => {
//     if (success) {
//       // Optionally update preview immediately
//       if (file) setPreview(URL.createObjectURL(file));

//       // Auto-close after short delay
//       const timer = setTimeout(() => {
//         onClose();
//       }, 500);

//       return () => clearTimeout(timer);
//     }
//   }, [success, onClose, file]);

//   const handleImageChange = (e) => {
//     const selected = e.target.files[0];
//     if (selected) {
//       setFile(selected);
//       setPreview(URL.createObjectURL(selected));
//       setCropping(true);
//     }
//   };

//   const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
//     setCroppedAreaPixels(croppedAreaPixels);
//   }, []);

//   const getCroppedImg = async () => {
//     if (!preview || !croppedAreaPixels) return null;

//     const image = new window.Image();
//     image.src = preview;

//     await new Promise((resolve) => image.onload = resolve);

//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");

//     canvas.width = croppedAreaPixels.width;
//     canvas.height = croppedAreaPixels.height;

//     ctx.drawImage(
//       image,
//       croppedAreaPixels.x,
//       croppedAreaPixels.y,
//       croppedAreaPixels.width,
//       croppedAreaPixels.height,
//       0,
//       0,
//       croppedAreaPixels.width,
//       croppedAreaPixels.height
//     );

//     return new Promise((resolve) => {
//       canvas.toBlob((blob) => resolve(blob), "image/jpeg");
//     });
//   };

//   const handleCropSave = async () => {
//     const croppedBlob = await getCroppedImg();
//     if (croppedBlob) {
//       const croppedFile = new File([croppedBlob], "cropped.jpg", {
//         type: "image/jpeg",
//       });
//       setFile(croppedFile);
//       setPreview(URL.createObjectURL(croppedBlob));
//       setCropping(false);
//     }
//   };

//   const handleUpload = () => {
//     if (!userId || !file) return;
//     dispatch(uploadProfileImage({ id: userId, image: file }));
//   };

//   return (
//     <div className="w-full max-w-sm mx-auto p-4 space-y-4 ">
//       <CardContent className="space-y-4 flex flex-col items-center">
//         <label htmlFor="fileInput" className="cursor-pointer">
//           <Image
//             src={preview || defaultAvatar}
//             alt="Selected Profile"
//             width={120}
//             height={120}
//             className="rounded-full w-24 h-24 object-cover border-2 border-gray-300"
//           />
//         </label>
//         <input
//           id="fileInput"
//           type="file"
//           accept="image/*"
//           onChange={handleImageChange}
//           className="hidden"
//         />

//         {cropping && (
//           <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
//             <div className="relative w-[90vw] h-[60vh] bg-white rounded-xl overflow-hidden">
//               <Cropper
//                 image={preview}
//                 crop={crop}
//                 zoom={zoom}
//                 aspect={1}
//                 cropShape="round"
//                 showGrid={false}
//                 onCropChange={setCrop}
//                 onZoomChange={setZoom}
//                 onCropComplete={onCropComplete}
//               />
//             </div>
//             <div className="flex gap-4 mt-4">
//               <Button
//                 onClick={() => setCropping(false)}
//                 variant="secondary"
//                 className="bg-gray-500 hover:bg-gray-600"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleCropSave}
//                 className="bg-blue-600 hover:bg-blue-700"
//               >
//                 Save Crop
//               </Button>
//             </div>
//           </div>
//         )}

//         <Button
//           onClick={handleUpload}
//           disabled={loading || !file || !userId}
//           className="w-full bg-blue-600 hover:bg-blue-700"
//         >
//           {loading ? "Uploading..." : "Upload"}
//         </Button>

//         {success && (
//           <p className="text-green-600 text-sm font-medium">
//             Upload successful!
//           </p>
//         )}
//         {error && (
//           <p className="text-red-600 text-sm font-medium">
//             {typeof error === "string"
//               ? error
//               : error.message || error.error_message || "Upload failed"}
//           </p>
//         )}
//         {!userId && (
//           <p className="text-red-500 text-sm font-semibold">
//             User ID is missing.
//           </p>
//         )}
//       </CardContent>
//     </div>
//   );
// };

// export default PlayerImage;











// ======================

// "use client";

// import React, { useState, useEffect, useCallback } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   uploadProfileImage,
//   resetProfileImageState,
// } from "@/redux/slices/profileImageSlice";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import Image from "next/image";
// import Cropper from "react-easy-crop";
// import { motion, AnimatePresence } from "framer-motion";
// import { CheckCircle2, UploadCloud, Loader2 } from "lucide-react";
// import defaultAvatar from "@/public/logo.jpg";

// const PlayerImage = ({ userId, onClose = () => {} }) => {
//   const dispatch = useDispatch();
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [cropping, setCropping] = useState(false);
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);
//   const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

//   const { loading, success, error } = useSelector(
//     (state) => state.profileImage
//   );

//   useEffect(() => {
//     return () => {
//       dispatch(resetProfileImageState());
//     };
//   }, [dispatch]);

//   useEffect(() => {
//     if (success) {
//       if (file) setPreview(URL.createObjectURL(file));
//       const timer = setTimeout(() => {
//         onClose();
//       }, 800);
//       return () => clearTimeout(timer);
//     }
//   }, [success, onClose, file]);

//   const handleImageChange = (e) => {
//     const selected = e.target.files[0];
//     if (selected) {
//       setFile(selected);
//       setPreview(URL.createObjectURL(selected));
//       setCropping(true);
//     }
//   };

//   const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
//     setCroppedAreaPixels(croppedAreaPixels);
//   }, []);

//   const getCroppedImg = async () => {
//     if (!preview || !croppedAreaPixels) return null;

//     const image = new window.Image();
//     image.src = preview;
//     await new Promise((resolve) => (image.onload = resolve));

//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");

//     canvas.width = croppedAreaPixels.width;
//     canvas.height = croppedAreaPixels.height;

//     ctx.drawImage(
//       image,
//       croppedAreaPixels.x,
//       croppedAreaPixels.y,
//       croppedAreaPixels.width,
//       croppedAreaPixels.height,
//       0,
//       0,
//       croppedAreaPixels.width,
//       croppedAreaPixels.height
//     );

//     return new Promise((resolve) => {
//       canvas.toBlob((blob) => resolve(blob), "image/jpeg");
//     });
//   };

//   const handleCropSave = async () => {
//     const croppedBlob = await getCroppedImg();
//     if (croppedBlob) {
//       const croppedFile = new File([croppedBlob], "cropped.jpg", {
//         type: "image/jpeg",
//       });
//       setFile(croppedFile);
//       setPreview(URL.createObjectURL(croppedBlob));
//       setCropping(false);
//     }
//   };

//   const handleUpload = () => {
//     if (!userId || !file) return;
//     dispatch(uploadProfileImage({ id: userId, image: file }));
//   };

//   return (
//     <motion.div
//       className="w-full max-w-2xl mx-auto p-4"
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, ease: "easeOut" }}
//     >
//       <Card className="shadow-xl border border-blue-100 bg-gradient-to-br from-[#0f172a]/90 to-[#1e3a8a]/80 rounded-2xl overflow-hidden">
//         <CardContent className="space-y-4 flex flex-col items-center py-6 ">
//           <motion.label
//             htmlFor="fileInput"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="cursor-pointer relative group"
//           >
//             <Image
//               src={preview || defaultAvatar}
//               alt="Selected Profile"
//               width={120}
//               height={120}
//               className="rounded-full w-28 h-28 object-cover border-4 border-blue-200 shadow-lg transition-all duration-300 group-hover:border-blue-500"
//             />
//             <motion.div
//               className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//               initial={false}
//             >
//               <UploadCloud className="w-6 h-6 text-white" />
//             </motion.div>
//           </motion.label>

//           <input
//             id="fileInput"
//             type="file"
//             accept="image/*"
//             onChange={handleImageChange}
//             className="hidden"
//           />

//           {/* 🟣 Cropping Overlay */}
//           <AnimatePresence>
//             {cropping && (
//               <motion.div
//                 className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 backdrop-blur-sm"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <motion.div
//                   initial={{ scale: 0.9, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   exit={{ scale: 0.9, opacity: 0 }}
//                   transition={{ duration: 0.4, ease: "easeOut" }}
//                   className="relative w-[90vw] h-[60vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
//                 >
//                   <Cropper
//                     image={preview}
//                     crop={crop}
//                     zoom={zoom}
//                     aspect={1}
//                     cropShape="round"
//                     showGrid={false}
//                     onCropChange={setCrop}
//                     onZoomChange={setZoom}
//                     onCropComplete={onCropComplete}
//                   />
//                 </motion.div>

//                 <motion.div
//                   className="flex gap-4 mt-6"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.3 }}
//                 >
//                   <Button
//                     onClick={() => setCropping(false)}
//                     variant="secondary"
//                     className="bg-gray-500 hover:bg-gray-600 text-white px-5"
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     onClick={handleCropSave}
//                     className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5"
//                   >
//                     Save Crop
//                   </Button>
//                 </motion.div>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* 🩵 Upload Button */}
//           <motion.div whileHover={{ scale: 1.03 }}>
//             <Button
//               onClick={handleUpload}
//               disabled={loading || !file || !userId}
//               className="w-full bg-gradient-to-r px-12 from-blue-600 to-indigo-300 hover:from-blue-700 hover:to-indigo-200 shadow-lg"
//             >
//               {loading ? (
//                 <div className="flex items-center gap-2">
//                   <Loader2 className="animate-spin w-4 h-4" />
//                   Uploading...
//                 </div>
//               ) : (
//                 "Upload"
//               )}
//             </Button>
//           </motion.div>

//           {/* 💚 Success Message */}
//           <AnimatePresence>
//             {success && (
//               <motion.p
//                 key="success"
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0 }}
//                 className="text-green-600 text-sm font-semibold flex items-center gap-2"
//               >
//                 <CheckCircle2 className="w-4 h-4" /> Upload successful!
//               </motion.p>
//             )}
//           </AnimatePresence>

//           {/* ❌ Error Message */}
//           {error && (
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="text-red-600 text-sm font-semibold"
//             >
//               {typeof error === "string"
//                 ? error
//                 : error.message || error.error_message || "Upload failed"}
//             </motion.p>
//           )}

//           {!userId && (
//             <p className="text-red-500 text-sm font-semibold">
//               User ID is missing.
//             </p>
//           )}
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// };

// export default PlayerImage;









// ==================== 111111111111111111111111111

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";


import { uploadProfileImage } from "@/redux/slices/profileImageSlice";
import { resetProfileImageState } from "@/redux/slices/profileImageSlice";
import { fetchUserProfile } from "@/redux/slices/profileSlice";
import { fetchMiniLeague } from "@/redux/slices/minileagueSlice";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, UploadCloud, Loader2 } from "lucide-react";
import defaultAvatar from "@/public/logo.jpg";


const PlayerImage = ({ userId, ladderId, onClose = () => {} }) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const { loading, success, error } = useSelector(
    (state) => state.profileImage
  );

  useEffect(() => {
    return () => {
      dispatch(resetProfileImageState());
    };
  }, [dispatch]);

  // ✅ FIXED: Real-time refresh on success
  useEffect(() => {
    if (success) {
      if (file) setPreview(URL.createObjectURL(file));
      const timer = setTimeout(() => {
        // ✅ REAL-TIME REFRESH
        if (userId) {
          dispatch(fetchUserProfile(userId));
        }
        if (ladderId) {
          dispatch(fetchMiniLeague({ ladder_id: ladderId, ladderType: "minileague" }));
        }
        onClose();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [success, onClose, file, userId, ladderId, dispatch]);

  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setCropping(true);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async () => {
    if (!preview || !croppedAreaPixels) return null;

    const image = new window.Image();
    image.src = preview;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    });
  };

  const handleCropSave = async () => {
    const croppedBlob = await getCroppedImg();
    if (croppedBlob) {
      const croppedFile = new File([croppedBlob], "cropped.jpg", {
        type: "image/jpeg",
      });
      setFile(croppedFile);
      setPreview(URL.createObjectURL(croppedBlob));
      setCropping(false);
    }
  };

  const handleUpload = () => {
    if (!userId || !file) return;
    dispatch(uploadProfileImage({ id: userId, image: file }));
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto p-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="shadow-xl border border-blue-100 bg-gradient-to-br from-[#0f172a]/90 to-[#1e3a8a]/80 rounded-2xl overflow-hidden">
        <CardContent className="space-y-4 flex flex-col items-center py-6 ">
          <motion.label
            htmlFor="fileInput"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer relative group"
          >
            <Image
              src={preview || defaultAvatar}
              alt="Selected Profile"
              width={120}
              height={120}
              className="rounded-full w-28 h-28 object-cover border-4 border-blue-200 shadow-lg transition-all duration-300 group-hover:border-blue-500"
            />
            <motion.div
              className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            >
              <UploadCloud className="w-6 h-6 text-white" />
            </motion.div>
          </motion.label>

          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {/* Cropping Overlay */}
          <AnimatePresence>
            {cropping && (
              <motion.div
                className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative w-[90vw] h-[60vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                  <Cropper
                    image={preview}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </motion.div>

                <motion.div
                  className="flex gap-4 mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={() => setCropping(false)}
                    variant="secondary"
                    className="bg-gray-500 hover:bg-gray-600 text-white px-5"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCropSave}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5"
                  >
                    Save Crop
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 🩵 Upload Button */}
          <motion.div whileHover={{ scale: 1.03 }}>
            <Button
              onClick={handleUpload}
              disabled={loading || !file || !userId}
              className="w-full bg-gradient-to-r px-12 from-blue-600 to-indigo-300 hover:from-blue-700 hover:to-indigo-200 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Uploading...
                </div>
              ) : (
                "Upload"
              )}
            </Button>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.p
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-green-600 text-sm font-semibold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Upload successful!
              </motion.p>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 text-sm font-semibold"
            >
              {typeof error === "string"
                ? error
                : error.message || error.error_message || "Upload failed"}
            </motion.p>
          )}

          {!userId && (
            <p className="text-red-500 text-sm font-semibold">
              User ID is missing.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlayerImage;
