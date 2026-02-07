// "use client";

// import { useEffect, useState } from "react";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import axios from "axios";

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";

// import { CheckCircle2, Copy, AlertTriangle } from "lucide-react";

// const clubSchema = z.object({
//   part1: z
//     .string()
//     .regex(/^[A-Za-z]{3,8}$/, "Must be between 3 to 8 letters only"),
//   part2: z.string().regex(/^[0-9]{4}$/, "Must be exactly 4 digits only"),
// });

// export default function AccessCodeParts() {
//   const [copied, setCopied] = useState(false);
//   const [fullCode, setFullCode] = useState("");
//   const [savedData, setSavedData] = useState({ clubId: "", clubPin: "" });
//   const [userId, setUserId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [successDialog, setSuccessDialog] = useState(false);
//   const [alreadyExistsDialog, setAlreadyExistsDialog] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");

//   const form = useForm({
//     resolver: zodResolver(clubSchema),
//     defaultValues: { part1: "", part2: "" },
//   });

//   const { watch } = form;
//   const part1 = watch("part1");
//   const part2 = watch("part2");

//   useEffect(() => setFullCode(`${part1}-${part2}`), [part1, part2]);

//   // Load user and fetch saved Club ID & PIN
//   useEffect(() => {
//     const fetchSavedClub = async () => {
//       const storedUser = localStorage.getItem("userData");
//       const userId = storedUser ? JSON.parse(storedUser)?.id : null;
//       if (!userId) return;
//       setUserId(userId);

//       try {
//         const res = await axios.get(
//           "https://ne-games.com/leaderBoard/api/app/user/subadmin",
//           {
//             params: { user_id: userId },
//             headers: {
//               APPKEY:
//                 "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy",
//             },
//           },
//         );

//         if (res.data?.status === 200 && res.data?.admin) {
//           const admin = res.data.admin;
//           setSavedData({
//             clubId: admin.login_id,
//             clubPin: String(admin.password),
//           });
//         }
//       } catch (err) {
//         console.error("Failed to fetch saved club:", err);
//       }
//     };

//     fetchSavedClub();
//   }, []);

//   const handleCopy = (value) => {
//     navigator.clipboard.writeText(value);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1500);
//   };

//   const handleSubmit = async (values) => {
//     if (!userId) return alert("User not logged in");
//     setLoading(true);
//     setErrorMessage("");

//     try {
//       const payload = {
//         user_id: userId,
//         login_id: values.part1,
//         password: values.part2,
//         user_type: "admin",
//       };

//       const res = await axios.post(
//         "https://ne-games.com/leaderBoard/api/app/user/create",
//         JSON.stringify(payload),
//         {
//           headers: {
//             APPKEY:
//               "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy",
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       if (
//         res.data?.status === 400 ||
//         res.data?.error_message?.includes("Login Id Exist")
//       ) {
//         setAlreadyExistsDialog(true);
//       } else if (res.data?.status === false) {
//         setErrorMessage(res.data?.message || "Club creation failed");
//       } else {
//         const saved = {
//           clubId: values.part1,
//           clubPin: values.part2,
//         };
//         setSavedData(saved);
//         localStorage.setItem("createdClub", JSON.stringify(saved));
//         setSuccessDialog(true);
//       }
//     } catch (err) {
//       console.error(err);
//       setErrorMessage(err?.response?.data?.error_message || "Server error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col px-4 py-8 justify-center md:flex-row gap-8 items-center md:items-stretch">
//       {/* LEFT DESCRIPTION */}
// <div className="flex flex-col items-center justify-center px-8 py-4 space-y-4 md:w-1/2 w-full rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg text-white">
//   <h2 className="text-2xl font-bold">Sports Solutions Pro</h2>
//   <p className="text-sm text-slate-200 ">
//     <h3 className="border-b border-gray-500 ">Club Setup Page</h3>
//     <br />
//     Please set up a <span className="font-bold">CLUB ID</span>, so that
//     your solutions are linked to your club and you can immediately (or at
//     a later date) invite other administrators from the same or different
//     sections of your club to help you run your section’s solutions or set
//     up solutions for their own sections.
//   </p>
//   <p className="text-sm text-slate-200">
//     Use the Club Set Up box to generate and refine your Sports Solutions
//     Unique Club Id that provides you with a simple memorable two code
//     access to your Solutions dashboard and the App.
//   </p>
// </div>

//       {/* RIGHT FORM CARD */}
//       <Card className="md:w-1/2 w-full rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg text-white">
//         <CardHeader className="text-center space-y-2">
//           <CardTitle className="text-xl font-extrabold tracking-wide">
//             Generate Club ID
//           </CardTitle>
//           <CardDescription className="text-xs text-slate-200">
//             Create a unique Club ID for Master Admin access
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-4">
//           <form
//             onSubmit={form.handleSubmit(handleSubmit)}
//             className="space-y-4"
//           >
//             {/* PART 1 */}
//             <div className="rounded-2xl bg-white/10 border border-white/15 p-4 flex gap-3">
//               <div className="flex-1 space-y-1">
//                 <Label className="text-[11px] uppercase text-slate-300">
//                   Club Id
//                 </Label>
//                 <Input
//                   {...form.register("part1")}
//                   maxLength={8}
//                   onInput={(e) => {
//                     e.target.value = e.target.value
//                       .replace(/[^A-Za-z]/g, "")
//                       .toUpperCase();
//                   }}
//                   className="h-10 bg-white text-black font-bold tracking-[0.35em] pr-16 rounded-xl"
//                 />
//                 {form.formState.errors.part1 && (
//                   <p className="text-xs text-red-400">
//                     {form.formState.errors.part1.message}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* PART 2 */}
//             <div className="rounded-2xl bg-white/10 border border-white/15 p-4 flex gap-3">
//               <div className="flex-1 space-y-1">
//                 <Label className="text-[11px] uppercase text-slate-300">
//                   Pin
//                 </Label>
//                 <Input
//                   {...form.register("part2")}
//                   maxLength={4}
//                   onInput={(e) => {
//                     e.target.value = e.target.value.replace(/[^0-9]/g, "");
//                   }}
//                   className="h-10 bg-white text-black font-bold tracking-[0.35em] pr-16 rounded-xl"
//                 />
//                 {form.formState.errors.part2 && (
//                   <p className="text-xs text-red-400">
//                     {form.formState.errors.part2.message}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Display saved Club ID & Pin */}
//             {savedData.clubId && savedData.clubPin && (
//               <div className="bg-transparent border-t shadow-lg p-3 rounded text-white text-center font-mono flex justify-center items-center gap-3">
//                 <span>
//                   Club ID: {savedData.clubId} | Pin: {savedData.clubPin}
//                 </span>

//                 <button
//                   type="button"
//                   onClick={async (e) => {
//                     e.preventDefault();

//                     const text = `${savedData.clubId}-${savedData.clubPin}`;
//                     const button = e.currentTarget;
//                     const originalText = button.textContent;

//                     try {
//                       button.textContent = "Copping...";
//                       button.disabled = true;

//                       await navigator.clipboard.writeText(text);

//                       button.textContent = "Copied";

//                       setTimeout(() => {
//                         button.textContent = originalText;
//                         button.disabled = false;
//                       }, 2000);
//                     } catch (err) {
//                       button.textContent = "Failed!";
//                       setTimeout(() => {
//                         button.textContent = originalText;
//                         button.disabled = false;
//                       }, 2000);
//                     }
//                   }}
//                   className="px-3 py-1 bg-teal-700 rounded hover:bg-teal-600 text-sm cursor-pointer disabled:cursor-wait disabled:opacity-70"
//                 >
//                   Copy
//                 </button>
//               </div>
//             )}

//             <Button
//               type="submit"
//               disabled={loading}
//               className="w-full rounded-xl bg-teal-800 hover:bg-teal-700 cursor-pointer shadow-lg disabled:opacity-50"
//             >
//               {loading ? "Creating Club ID..." : "Generate Club ID"}
//             </Button>

//             {errorMessage && (
//               <p className="text-xs text-red-400 text-center">{errorMessage}</p>
//             )}
//           </form>
//         </CardContent>
//       </Card>

//       {/* SUCCESS DIALOG */}
//       <Dialog open={successDialog} onOpenChange={() => setSuccessDialog(false)}>
//         <DialogContent className="sm:max-w-md text-center">
//           <DialogHeader>
//             <div className="flex justify-center mb-2">
//               <CheckCircle2 className="h-12 w-12 text-green-500" />
//             </div>
//             <DialogTitle>Club ID Created Successfully</DialogTitle>
//             <DialogDescription>
//               Club ID: <span className="font-mono">{savedData.clubId}</span> |
//               PIN: <span className="font-mono">{savedData.clubPin}</span>
//             </DialogDescription>
//           </DialogHeader>

//           <DialogFooter className="mt-4 flex justify-center">
//             <Button
//               onClick={() => setSuccessDialog(false)}
//               className="px-10 bg-teal-800 w-full"
//             >
//               OK
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* ALREADY EXISTS DIALOG */}
//       <Dialog
//         open={alreadyExistsDialog}
//         onOpenChange={() => setAlreadyExistsDialog(false)}
//       >
//         <DialogContent className="sm:max-w-md text-center">
//           <DialogHeader>
//             <div className="flex justify-center mb-2">
//               <AlertTriangle className="h-12 w-12 text-yellow-500" />
//             </div>
//             <DialogTitle>Club ID Already Exists</DialogTitle>
//             <DialogDescription>
//               The Club ID <span className="font-mono">{part1}</span> already
//               exists.
//               <br />
//               Please use the existing Club ID or choose a new one.
//             </DialogDescription>
//           </DialogHeader>

//           <DialogFooter className="mt-4 flex justify-center gap-2">
//             <Button
//               onClick={() => setAlreadyExistsDialog(false)}
//               className="px-10 bg-yellow-600 w-full"
//             >
//               OK
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// ================================================ final changes club id ui ======================

// "use client";

// import { useEffect, useState } from "react";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import axios from "axios";

// import { X } from "lucide-react";

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";

// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerDescription,
// } from "@/components/ui/drawer";

// import { CheckCircle2, PencilLine } from "lucide-react";
// import MasterAdminContent from "./MasterAdminContent";

// // Zod Schema
// const clubSchema = z.object({
//   part1: z
//     .string()
//     .min(3, "Min 3 letters required")
//     .max(8, "Max 8 letters allowed")
//     .regex(/^[A-Za-z]+$/, "Letters only please"),
//   part2: z
//     .string()
//     .length(4, "PIN must be exactly 4 digits")
//     .regex(/^[0-9]+$/, "Digits only please"),
// });

// export default function AccessCodeParts() {
//   const [copied, setCopied] = useState(false);
//   const [savedData, setSavedData] = useState({ clubId: "", clubPin: "" });
//   const [userId, setUserId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [successDialog, setSuccessDialog] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   // const [alreadyExistsDialog, setAlreadyExistsDialog] = useState(false);


//   const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
//   const [pendingUpdateValues, setPendingUpdateValues] = useState(null);

//   // OLD FORM (Main Card): Isme Zod validation (zodResolver) add kiya hai
//   const form = useForm({
//     resolver: zodResolver(clubSchema),
//     defaultValues: { part1: "", part2: "" },
//   });

//   // DRAWER FORM: Isme validation nahi hai (simple useForm)
//   const drawerForm = useForm({
//     defaultValues: { part1: "", part2: "" },
//   });

//   useEffect(() => {
//     const fetchSavedClub = async () => {
//       const storedUser = localStorage.getItem("userData");
//       const id = storedUser ? JSON.parse(storedUser)?.id : null;
//       if (!id) return;
//       setUserId(id);

//       try {
//         const res = await axios.get(
//           "https://ne-games.com/leaderBoard/api/app/user/subadmin",
//           {
//             params: { user_id: id },
//             headers: {
//               APPKEY:
//                 "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy",
//             },
//           },
//         );

//         if (res.data?.status === 200 && res.data?.admin) {
//           const admin = res.data.admin;
//           const data = {
//             clubId: admin.login_id,
//             clubPin: String(admin.password),
//           };
//           setSavedData(data);
//           drawerForm.reset({ part1: data.clubId, part2: data.clubPin });
//         }
//       } catch (err) {
//         console.error("Failed to fetch saved club:", err);
//       }
//     };
//     fetchSavedClub();
//   }, [drawerForm]);

//   const handleSubmit = async (values) => {
//     if (!userId) return alert("User not logged in");
//     setLoading(true);
//     setErrorMessage("");

//     try {
//       const payload = {
//         user_id: userId,
//         login_id: values.part1,
//         password: values.part2,
//         user_type: "admin",
//       };

//       const res = await axios.post(
//         "https://ne-games.com/leaderBoard/api/app/user/create",
//         payload,
//         {
//           headers: {
//             APPKEY:
//               "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy",
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       if (res.data?.status === false) {
//         setErrorMessage(res.data?.message || "Action failed");
//       } else {
//         setSavedData({ clubId: values.part1, clubPin: values.part2 });
//         setSuccessDialog(true);
//         setIsDrawerOpen(false);
//         form.reset();
//       }
//     } catch (err) {
//       setErrorMessage("Server error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDrawerSubmit = (values) => {
//     setPendingUpdateValues(values); // store values temporarily
//     setConfirmDialogOpen(true); // open confirmation dialog
//   };

//   const handleUpdate = async (values) => {
//     if (!userId) return alert("User not logged in");
//     setLoading(true);
//     setErrorMessage("");

//     try {
//       // Correct payload structure
//       const payload = {
//         user_id: userId,
//         login_id: values.part1,
//         password: values.part2,
//         user_type: "admin",
//       };

//       const res = await axios.post(
//         "https://ne-games.com/leaderBoard/api/app/user/update",
//         payload, // payload directly
//         {
//           headers: {
//             APPKEY:
//               "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy",
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       if (res.data?.status === false) {
//         setErrorMessage(res.data?.message || "Update failed");
//       } else {
//         setSavedData({ clubId: values.part1, clubPin: values.part2 });
//         setIsDrawerOpen(false);
//         setSuccessDialog(true);
//         drawerForm.reset(values); // update drawer form with latest
//       }
//     } catch (err) {
//       console.error(err);
//       setErrorMessage(err?.response?.data?.error_message || "Server error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col px-4 py-8 justify-center md:flex-row gap-8 items-center md:items-stretch">
//       {/* LEFT SIDE INFO */}

//       <MasterAdminContent />

//       {/* RIGHT CARD (OLD FORM WITH VALIDATION) */}
//       <Card className="md:w-1/2 w-full rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl text-white">
//         <CardHeader className="text-center">
//           <CardTitle className="text-xl font-extrabold tracking-wide">
//             Generate Club ID
//           </CardTitle>
//           <CardDescription className="text-xs text-slate-200">
//             {/* Validation is active here */} {" "}
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-4">
//           <form
//             onSubmit={form.handleSubmit(handleSubmit)}
//             className="space-y-4"
//           >
//             {/* Club ID Field */}
//             <div className="space-y-1">
//               <Label className="text-[11px] uppercase text-slate-300">
//                 Club Id
//               </Label>
//               <Input
//                 {...form.register("part1")}
//                 maxLength={8}
//                 onInput={(e) =>
//                   (e.target.value = e.target.value
//                     .replace(/[^A-Za-z]/g, "")
//                     .toUpperCase())
//                 }
//                 className="h-10 bg-white text-black font-bold tracking-[0.35em] rounded-xl"
//               />
//               {/* Validation Error Message */}
//               {form.formState.errors.part1 && (
//                 <p className="text-[10px] text-red-400 mt-1">
//                   {form.formState.errors.part1.message}
//                 </p>
//               )}
//             </div>

//             {/* Pin Field */}
//             <div className="space-y-1">
//               <Label className="text-[11px] uppercase text-slate-300">
//                 Pin
//               </Label>
//               <Input
//                 {...form.register("part2")}
//                 maxLength={4}
//                 onInput={(e) =>
//                   (e.target.value = e.target.value.replace(/[^0-9]/g, ""))
//                 }
//                 className="h-10 bg-white text-black font-bold tracking-[0.35em] rounded-xl"
//               />
//               {/* Validation Error Message */}
//               {form.formState.errors.part2 && (
//                 <p className="text-[10px] text-red-400 mt-1">
//                   {form.formState.errors.part2.message}
//                 </p>
//               )}
//             </div>

//             {/* Saved Data Bar */}
//             {savedData.clubId && (
//               <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex justify-between items-center">
//                 <div className="flex items-center gap-2">
                 
//                   <span className="font-mono text-xs text-slate-300">
//                     ID: {savedData.clubId} | PIN: {savedData.clubPin}
//                   </span>
//                       <Button
//                   type="button"
//                   onClick={() => {
//                     navigator.clipboard.writeText(
//                       `${savedData.clubId}-${savedData.clubPin}`,
//                     );
//                     setCopied(true);
//                     setTimeout(() => setCopied(false), 2000);
//                   }}
//                   className="px-3 h-7 text-[10px] cursor-pointer bg-teal-700 hover:bg-teal-600"
//                 >
//                   {copied ? "Copied" : "Copy"}
//                 </Button>
//                 </div>
            


//                 <div className="flex items-center justify-between gap-2">
//                  <span className="font-mono text-xs text-slate-100">
//                     Update Club Id & PIN
//                   </span>
//                    <Button
//                     type="button"
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => setIsDrawerOpen(true)}
//                     className="h-6 w-6 bg-green-400 text-teal-800 hover:bg-white/10 cursor-pointer"
//                   >
//                     <PencilLine className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             )}

//             <Button
//               disabled={loading}
//               type="submit"
//               className="w-full rounded-xl bg-teal-800 hover:bg-teal-700 shadow-lg"
//             >
//               {loading ? "Processing..." : "Generate Club ID"}
//             </Button>
//             {errorMessage && (
//               <p className="text-xs text-red-400 text-center">{errorMessage}</p>
//             )}
//           </form>
//         </CardContent>
//       </Card>

//       {/* DRAWER (NO VALIDATION) */}
//       <Drawer
//         open={isDrawerOpen}
//         onOpenChange={setIsDrawerOpen}
//         direction="right"
//       >
//         <DrawerContent className="h-full w-[350px] ml-auto rounded-l-3xl bg-slate-900 text-white p-6 border-l border-white/20">
//           <button
//             type="button"
//             onClick={() => setIsDrawerOpen(false)}
//             className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-200"
//           >
//             <X className="h-5 w-5" />
//           </button>
//           <DrawerHeader className="px-0">
//             <DrawerTitle className="text-white">Edit Details</DrawerTitle>
//             <DrawerDescription className="text-slate-400 text-xs">
//               Update your clubId & PIN{" "}
//             </DrawerDescription>
//           </DrawerHeader>

//           <form
//             onSubmit={drawerForm.handleSubmit(handleDrawerSubmit)}
//             className="space-y-6 mt-6"
//           >
//             <div className="space-y-2">
//               <Label className="text-xs uppercase text-slate-400">
//                 Club Id
//               </Label>
//               <Input
//                 {...drawerForm.register("part1")}
//                 className="bg-white text-black font-bold h-11"
//               />
//             </div>
//             <div className="space-y-2">
//               <Label className="text-xs uppercase text-slate-400">Pin</Label>
//               <Input
//                 {...drawerForm.register("part2")}
//                 className="bg-white text-black font-bold h-11"
//               />
//             </div>
//             <Button
//               disabled={loading}
//               type="submit"
//               className="w-full bg-teal-700 hover:bg-teal-800 h-11 cursor-pointer"
//             >
//               Update clubId
//             </Button>
//           </form>
//         </DrawerContent>
//       </Drawer>

//       <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
//         <DialogContent className="sm:max-w-md text-center bg-slate-900 text-white border-white/20">
//           <DialogHeader>
//             <DialogTitle>Confirm Update</DialogTitle>
//             <DialogDescription>
//               Are you sure you want to update your Club ID & PIN?
//             </DialogDescription>
//           </DialogHeader>

//           <div className="mt-6 flex justify-between gap-4">
//             <Button
//               variant="outline"
//               onClick={() => setConfirmDialogOpen(false)}
//               className="flex-1 text-black"
//             >
//               Cancel
//             </Button>
//             <Button
//               className="flex-1 bg-teal-700 hover:bg-teal-800 cursor-pointer"
//               onClick={() => {
//                 if (pendingUpdateValues) handleUpdate(pendingUpdateValues);
//                 setConfirmDialogOpen(false);
//               }}
//             >
//               Confirm
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* ALREADY EXISTS DIALOG */}
//       {/* <Dialog
//         open={alreadyExistsDialog}
//         onOpenChange={() => setAlreadyExistsDialog(false)}
//       >
//         <DialogContent className="sm:max-w-md text-center">
//           <DialogHeader>
//             <div className="flex justify-center mb-2">
//               <AlertTriangle className="h-12 w-12 text-yellow-500" />
//             </div>
//             <DialogTitle>Club ID Already Exists</DialogTitle>
//             <DialogDescription>
//               The Club ID <span className="font-mono">{part1}</span> already
//               exists.
//               <br />
//               Please use the existing Club ID or choose a new one.
//             </DialogDescription>
//           </DialogHeader>

//           <DialogFooter className="mt-4 flex justify-center gap-2">
//             <Button
//               onClick={() => setAlreadyExistsDialog(false)}
//               className="px-10 bg-yellow-600 w-full"
//             >
//               OK
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog> */}

//       {/* SUCCESS DIALOG */}
//       <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
//         <DialogContent className="sm:max-w-md text-center bg-slate-900 text-white border-white/20">
//           <div className="flex justify-center mb-2">
//             <CheckCircle2 className="h-12 w-12 text-green-500" />
//           </div>
//           <DialogTitle>Success!</DialogTitle>
//           <Button
//             onClick={() => setSuccessDialog(false)}
//             className="bg-teal-700 w-full mt-4"
//           >
//             Done
//           </Button>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }









// ===========================================

"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { X, CheckCircle2, PencilLine } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import MasterAdminContent from "./MasterAdminContent";

// 1. Zod Schema (Centralized)
const clubSchema = z.object({
  part1: z
    .string()
    .min(3, "Min 3 letters required")
    .max(8, "Max 8 letters allowed")
    .regex(/^[A-Z]+$/, "Capital letters only"), // Strictly Capital as per your requirement
  part2: z
    .string()
    .length(4, "PIN must be exactly 4 digits")
    .regex(/^[0-9]+$/, "Digits only please"),
});

export default function AccessCodeParts() {
  const [copied, setCopied] = useState(false);
  const [savedData, setSavedData] = useState({ clubId: "", clubPin: "" });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingUpdateValues, setPendingUpdateValues] = useState(null);

  // Main Form Validation
  const form = useForm({
    resolver: zodResolver(clubSchema),
    defaultValues: { part1: "", part2: "" },
  });

  // 2. Drawer Form Validation (Added zodResolver here)
  const drawerForm = useForm({
    resolver: zodResolver(clubSchema),
    defaultValues: { part1: "", part2: "" },
  });

  useEffect(() => {
    const fetchSavedClub = async () => {
      const storedUser = localStorage.getItem("userData");
      const id = storedUser ? JSON.parse(storedUser)?.id : null;
      if (!id) return;
      setUserId(id);

      try {
        const res = await axios.get(
          "https://ne-games.com/leaderBoard/api/app/user/subadmin",
          {
            params: { user_id: id },
            headers: { APPKEY: "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy" },
          },
        );

        if (res.data?.status === 200 && res.data?.admin) {
          const admin = res.data.admin;
          const data = {
            clubId: admin.login_id,
            clubPin: String(admin.password),
          };
          setSavedData(data);
          drawerForm.reset({ part1: data.clubId, part2: data.clubPin });
        }
      } catch (err) {
        console.error("Failed to fetch saved club:", err);
      }
    };
    fetchSavedClub();
  }, [drawerForm]);

  const handleSubmit = async (values) => {
    if (!userId) return alert("User not logged in");
    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        user_id: userId,
        login_id: values.part1.toUpperCase(),
        password: values.part2,
        user_type: "admin",
      };

      const res = await axios.post("https://ne-games.com/leaderBoard/api/app/user/create", payload, {
        headers: {
          APPKEY: "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy",
          "Content-Type": "application/json",
        },
      });

      if (res.data?.status === false) {
        setErrorMessage(res.data?.message || "Action failed");
      } else {
        setSavedData({ clubId: values.part1, clubPin: values.part2 });
        setSuccessDialog(true);
        form.reset();
      }
    } catch (err) {
      setErrorMessage("Server error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerSubmit = (values) => {
    setPendingUpdateValues(values);
    setConfirmDialogOpen(true);
  };

  const handleUpdate = async (values) => {
    if (!userId) return alert("User not logged in");
    setLoading(true);
    try {
      const payload = {
        user_id: userId,
        login_id: values.part1.toUpperCase(),
        password: values.part2,
        user_type: "admin",
      };

      const res = await axios.post("https://ne-games.com/leaderBoard/api/app/user/update", payload, {
        headers: {
          APPKEY: "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy",
          "Content-Type": "application/json",
        },
      });

      if (res.data?.status === false) {
        setErrorMessage(res.data?.message || "Update failed");
      } else {
        setSavedData({ clubId: values.part1, clubPin: values.part2 });
        setIsDrawerOpen(false);
        setSuccessDialog(true);
        drawerForm.reset(values);
      }
    } catch (err) {
      setErrorMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col px-4 py-8 justify-center md:flex-row gap-8 items-center md:items-stretch">
      <MasterAdminContent />

      {/* MAIN CARD */}
      <Card className="md:w-1/2 w-full rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-extrabold tracking-wide">Generate Club ID</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-[11px] uppercase text-slate-300">Club Id</Label>
              <Input
                {...form.register("part1")}
                maxLength={8}
                onChange={(e) => e.target.value = e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase()}
                className="h-10 bg-white text-black font-bold tracking-[0.35em] rounded-xl"
              />
              {form.formState.errors.part1 && <p className="text-[10px] text-red-400 mt-1">{form.formState.errors.part1.message}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] uppercase text-slate-300">Pin</Label>
              <Input
                {...form.register("part2")}
                maxLength={4}
                onChange={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, "")}
                className="h-10 bg-white text-black font-bold tracking-[0.35em] rounded-xl"
              />
              {form.formState.errors.part2 && <p className="text-[10px] text-red-400 mt-1">{form.formState.errors.part2.message}</p>}
            </div>

            {savedData.clubId && (
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex justify-between items-center">
                <span className="font-mono text-xs text-slate-300">ID: {savedData.clubId} | PIN: {savedData.clubPin}</span>
                <div className="flex gap-2">
                  <Button type="button" onClick={() => { navigator.clipboard.writeText(`${savedData.clubId}-${savedData.clubPin}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="px-3 h-7 text-[10px] bg-teal-700 cursor-pointer hover:bg-teal-600">
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button type="button" size="icon" onClick={() => setIsDrawerOpen(true)} className="h-7 w-7 bg-green-400 text-teal-800 cursor-pointer">
                    <PencilLine className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <Button disabled={loading} type="submit" className="w-full rounded-xl bg-teal-800 hover:bg-teal-700">
              {loading ? "Processing..." : "Generate Club ID"}
            </Button>
            {errorMessage && <p className="text-xs text-red-400 text-center">{errorMessage}</p>}
          </form>
        </CardContent>
      </Card>

      {/* DRAWER WITH VALIDATION */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="right">
        <DrawerContent className="h-full w-[350px] ml-auto rounded-l-3xl bg-slate-900 text-white p-6 border-l border-white/20">
          <button onClick={() => setIsDrawerOpen(false)} className="absolute top-4 right-4 p-1 text-slate-400"><X /></button>
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-white">Edit Details</DrawerTitle>
            <DrawerDescription className="text-slate-400 text-xs">Update your clubId & PIN</DrawerDescription>
          </DrawerHeader>

          <form onSubmit={drawerForm.handleSubmit(handleDrawerSubmit)} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-slate-400">Club Id</Label>
              <Input
                {...drawerForm.register("part1")}
                maxLength={8}
                onChange={(e) => e.target.value = e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase()}
                className="bg-white text-black font-bold h-11"
              />
              {drawerForm.formState.errors.part1 && <p className="text-[10px] text-red-400">{drawerForm.formState.errors.part1.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase text-slate-400">Pin</Label>
              <Input
                {...drawerForm.register("part2")}
                maxLength={4}
                onChange={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, "")}
                className="bg-white text-black font-bold h-11"
              />
              {drawerForm.formState.errors.part2 && <p className="text-[10px] text-red-400">{drawerForm.formState.errors.part2.message}</p>}
            </div>

            <Button disabled={loading} type="submit" className="w-full cursor-pointer bg-teal-700 hover:bg-teal-800 h-11">
              Update clubId
            </Button>
          </form>
        </DrawerContent>
      </Drawer>

      {/* CONFIRM DIALOG */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md text-center bg-slate-900 text-white border-white/20">
          <DialogHeader>
            <DialogTitle>Confirm Update</DialogTitle>
            <DialogDescription>Are you sure you want to update your Club ID & PIN?</DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex gap-4">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} className="flex-1 text-black">Cancel</Button>
            <Button className="flex-1 bg-teal-700" onClick={() => { if (pendingUpdateValues) handleUpdate(pendingUpdateValues); setConfirmDialogOpen(false); }}>Confirm</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SUCCESS DIALOG */}
      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent className="sm:max-w-md text-center bg-slate-900 text-white border-white/20">
          <div className="flex justify-center mb-2"><CheckCircle2 className="h-12 w-12 text-green-500" /></div>
          <DialogTitle>Success!</DialogTitle>
          <Button onClick={() => setSuccessDialog(false)} className="bg-teal-700 w-full mt-4">Done</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}