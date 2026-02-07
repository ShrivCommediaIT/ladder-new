
// "use client";

// import React, { useState } from "react";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import clsx from "clsx";
// import { Button } from "@/components/ui/button";
// import { useDispatch, useSelector } from "react-redux";
// import { changePlayerStatus } from "@/redux/slices/playerStatusSlice";
// import { toast } from "react-toastify";

// import {
//   AlertDialog,
//   AlertDialogTrigger,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogCancel,
//   AlertDialogAction,
// } from "@/components/ui/alert-dialog";

// import { motion, AnimatePresence } from "framer-motion";

// const StatusPlayer = ({ playerId, onClose = () => {}, }) => {
//   const [status, setStatus] = useState("1");
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false); // ✅ control dialog
//   const dispatch = useDispatch();
//   const { loading } = useSelector((state) => state.playerStatus);

//   const handleStatusUpdate = () => {
//   if (!playerId) {
//     toast.error("Player ID missing. Please refresh.");
//     return;
//   }

//   setIsUpdating(true);

//   dispatch(changePlayerStatus({ user_id: playerId, player_status: status }))
//     .unwrap()
//     .then((res) => {
//       // toast.success(res.message || "Status updated successfully");

//       // Close the parent modal
//       onClose();

//       // Close the AlertDialog
//       setDialogOpen(false);
//     })
//     .catch((err) => {
//       toast.error(err || "Failed to update status");
//     })
//     .finally(() => {
//       setTimeout(() => setIsUpdating(false), 500);
//     });
// };


//   return (
//     <div className="p-4 space-y-6">
//       <h3 className="text-lg font-semibold">Player Status</h3>

//       <AnimatePresence>
//         {isUpdating ? (
//           <motion.div
//             key="skeleton"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="space-y-4"
//           >
//             <div className="h-6 w-40 bg-gray-300 rounded animate-pulse" />
//             <div className="h-6 w-40 bg-gray-300 rounded animate-pulse" />
//           </motion.div>
//         ) : (
//           <RadioGroup
//             key="real-content"
//             value={status}
//             onValueChange={setStatus}
//             className="space-y-4"
//           >
//             <div className="flex items-center space-x-3">
//               <RadioGroupItem
//                 value="1"
//                 id="available"
//                 className={clsx(
//                   "border-2",
//                   status === "1" ? "border-green-600 bg-green-100" : ""
//                 )}
//               />
//               <Label htmlFor="available" className="text-base text-green-700">
//                 Available
//               </Label>
//             </div>
//             <div className="flex items-center space-x-3">
//               <RadioGroupItem
//                 value="2"
//                 id="injured"
//                 className={clsx(
//                   "border-2",
//                   status === "2" ? "border-red-600 bg-red-100" : ""
//                 )}
//               />
//               <Label htmlFor="injured" className="text-base text-red-700">
//                 Unavailable
//               </Label>
//             </div>
//           </RadioGroup>
//         )}
//       </AnimatePresence>

//       {/* Confirmation Dialog */}
//       {/* <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <AlertDialogTrigger asChild>
//           <Button
//             disabled={loading || isUpdating}
//             className="mt-2 bg-blue-600 hover:bg-blue-700"
//           >
//             {loading || isUpdating ? "Updating..." : "Update Status"}
//           </Button>
//         </AlertDialogTrigger>

//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This will update the player's status to{" "}
//               <strong>{status === "1" ? "Available" : "Unavailable"}</strong>.
//               <br />
//               You can always change it later.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel className="bg-red-100 hover:bg-red-200 cursor-pointer">
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleStatusUpdate}
//               disabled={loading || isUpdating}
//               className="bg-green-600 hover:bg-green-700 cursor-pointer"
//             >
//               {loading || isUpdating ? "Updating..." : "Confirm"}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog> */}

//       <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
//   <AlertDialogTrigger asChild>
//     <Button
//       onClick={() => setDialogOpen(true)} // ✅ manually open dialog
//       disabled={loading || isUpdating}
//       className="mt-2 bg-blue-600 hover:bg-blue-700"
//     >
//       {loading || isUpdating ? "Updating..." : "Update Status"}
//     </Button>
//   </AlertDialogTrigger>

//   <AlertDialogContent>
//     <AlertDialogHeader>
//       <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//       <AlertDialogDescription>
//         This will update the player's status to{" "}
//         <strong>{status === "1" ? "Available" : "Unavailable"}</strong>.
//         <br />
//         You can always change it later.
//       </AlertDialogDescription>
//     </AlertDialogHeader>
//     <AlertDialogFooter>
//       <AlertDialogCancel className="bg-red-100 hover:bg-red-200 cursor-pointer">
//         Cancel
//       </AlertDialogCancel>
//       <AlertDialogAction
//         onClick={handleStatusUpdate} // ✅ on success will close dialog
//         disabled={loading || isUpdating}
//         className="bg-green-600 hover:bg-green-700 cursor-pointer"
//       >
//         {loading || isUpdating ? "Updating..." : "Confirm"}
//       </AlertDialogAction>
//     </AlertDialogFooter>
//   </AlertDialogContent>
// </AlertDialog>

//     </div>
//   );
// };

// export default StatusPlayer;













// ==========================

"use client";

import React, { useState } from "react";
// Assuming these components are from your shadcn/ui library
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { changePlayerStatus } from "@/redux/slices/playerStatusSlice";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { motion, AnimatePresence } from "framer-motion";

// --- Framer Motion Components for Radio Items ---
const RadioMotionItem = ({ value, id, status, children }) => {
  const isSelected = status === value;
  const gradientClass =
    value === "1"
      ? "bg-gradient-to-r from-blue-400 to-blue-950 border-blue-950"
      : "bg-gradient-to-r from-red-400 to-red-600 border-red-700";
  const textColor = value === "1" ? "text-green-700" : "text-red-700";

  return (
    <motion.div
      className={clsx(
        "flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 shadow-md",
        "hover:shadow-lg",
        isSelected
          ? `${gradientClass} shadow-xl text-white`
          : "bg-white border border-gray-200 hover:bg-gray-50"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.02, rotate: isSelected ? 0 : -0.5 }} // Subtle 3D-like tilt on hover
      whileTap={{ scale: 0.98 }}
    >
      <RadioGroupItem
        value={value}
        id={id}
        className={clsx(
          "h-5 w-5 border-2 transition-colors",
          isSelected
            ? "border-white text-white"
            : `${textColor} border-gray-400`
        )}
      />
      <Label
        htmlFor={id}
        className={clsx(
          "text-base font-medium",
          isSelected ? "text-white" : textColor
        )}
      >
        {children}
      </Label>
    </motion.div>
  );
};

// ------------------------------------------------

const StatusPlayer = ({ playerId, onClose = () => {} }) => {
  const [status, setStatus] = useState("1");
  const [isUpdating, setIsUpdating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.playerStatus);

  const handleStatusUpdate = () => {
    if (!playerId) {
      toast.error("Player ID missing. Please refresh.");
      return;
    }

    setIsUpdating(true);

    dispatch(changePlayerStatus({ user_id: playerId, player_status: status }))
      .unwrap()
      .then((res) => {
        toast.success(res.message || "Status updated successfully");
        onClose();
        setDialogOpen(false);
      })
      .catch((err) => {
        toast.error(err || "Failed to update status");
      })
      .finally(() => {
        setTimeout(() => setIsUpdating(false), 500);
      });
  };

  const getStatusLabel = (s) => (s === "1" ? "Available" : "Unavailable");

  return (
    <motion.div
      className="p-6 space-y-8 bg-gray-900 rounded-xl shadow-2xl"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <h3 className="text-xl font-bold text-gray-100 border-b pb-2">
        Update Player Status 🚀
      </h3>

      <AnimatePresence mode="wait">
        {isUpdating || loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
          </motion.div>
        ) : (
          <motion.div
            key="real-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <RadioGroup
              value={status}
              onValueChange={setStatus}
              className="space-y-4 w-md"
            >
              <RadioMotionItem value="1" id="available" status={status}>
                Available
              </RadioMotionItem>
              <RadioMotionItem value="2" id="unavailable" status={status}>
                Unavailable (Injured/Suspended)
              </RadioMotionItem>
            </RadioGroup>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full"
          >
            <Button
              onClick={() => setDialogOpen(true)}
              disabled={loading || isUpdating}
              className={clsx(
                "mt-4 w-md h-12 text-lg font-semibold transition-all duration-300",
                loading || isUpdating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 cursor-pointer hover:bg-indigo-700 shadow-lg hover:shadow-xl"
              )}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={loading || isUpdating ? "updating" : "update"}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  {loading || isUpdating ? "Updating Status..." : "Update Status"}
                </motion.span>
              </AnimatePresence>
            </Button>
          </motion.div>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">
              Confirm Status Update
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Are you sure you want to change the player's status to{" "}
              <strong
                className={clsx(
                  "font-extrabold",
                  status === "1" ? "text-green-600" : "text-red-600"
                )}
              >
                {getStatusLabel(status)}
              </strong>
              ?
              <br />
              This action will be immediate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-gray-100 transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              disabled={loading || isUpdating}
              className={clsx(
                "bg-green-600 hover:bg-green-700 transition-all duration-200",
                loading || isUpdating
                  ? "bg-gray-400 hover:bg-gray-400"
                  : ""
              )}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default StatusPlayer;


