"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getRequest, postRequest } from "@/services/apiService";
import { API_ENDPOINTS } from "@/constants/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { CheckCircle2 } from "lucide-react";

/* ---------------- ZOD SCHEMA ---------------- */
const formSchema = z.object({
  adminName: z.string().min(2, "Admin name is required"),
  clubId: z
    .string()
    .min(3)
    .max(8)
    .regex(/^[A-Z]+$/, "Only uppercase letters allowed"),
  sportsName: z.string().min(2, "Sports name is required"),
  pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
});

export default function AdminClubId() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);
  const [currentPage, setCurrentPage] = useState(1);
  const [clubIdFixed, setClubIdFixed] = useState("");
  const [successDialog, setSuccessDialog] = useState(false);
  const [pinAlertOpen, setPinAlertOpen] = useState(false);

  const [loginPinExistAlert, setLoginPinExistAlert] = useState(false);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  /* ---------- Inside AdminClubId Component ---------- */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const handleDeleteClick = (item) => {
    setAdminToDelete(item);
    setDeleteDialogOpen(true); // open confirmation dialog
  };

  

  const handleConfirmDelete = async () => {
    if (!adminToDelete?.id) {
      toast.error("Missing sub admin id");
      return;
    }

    try {
      setLoading(true);

      const res = await getRequest("/app/user/delete", { id: adminToDelete.id });

      if (res?.status === 200 || res?.status === true) {
         await fetchSubAdmins();
      } else {
        toast.error(res?.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Delete API error");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setAdminToDelete(null);
    }
  };

  const rowsPerPage = 8;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adminName: "",
      clubId: "",
      sportsName: "",
      pin: "",
    },
  });

  /* --------- FETCH SUB ADMINS --------- */
const fetchSubAdmins = async () => {
  const storedUser = sessionStorage.getItem("userData");
  const userId = storedUser ? JSON.parse(storedUser)?.id : null;
  if (!userId) return;

  setLoading(true);
  setErrorMessage("");

  try {
    const res = await getRequest("/app/user/subadmin", { user_id: userId });

    if (res?.status === 200) {
      const admin = res.admin;
      const subAdmins = res.data || [];

      setClubIdFixed(admin.login_id);
      form.setValue("clubId", admin.login_id);

      const mapped = subAdmins.map((item) => ({
        id: item.id,
        adminName: item.name,
        clubId: item.login_id,
        sportsName: item.sport_name,
        pin: String(item.password),
      }));

      setData(mapped);
    }
  } catch {
    setErrorMessage("Server error");
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  fetchSubAdmins();
}, []);



  /* --------- PIN LOGIC --------- */
  const handlePinChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newPin = [...pinDigits];
    newPin[index] = value;
    setPinDigits(newPin);

    if (value && index < 3)
      document.getElementById(`pin-${index + 1}`)?.focus();
    if (!value && index > 0)
      document.getElementById(`pin-${index - 1}`)?.focus();

    form.setValue("pin", newPin.join(""));
  };

  /* --------- SUBMIT NEW SUB ADMIN --------- */
  const handleSubmit = async (values) => {
    const storedUser = sessionStorage.getItem("userData");
    const userId = storedUser ? JSON.parse(storedUser)?.id : null;
    if (!userId) return toast.error("User not logged in");

    setLoading(true);
    setErrorMessage("");

    const newPin = String(values.pin).trim();
    const isDuplicate = data.some((item) => String(item.pin).trim() === newPin);

    if (isDuplicate) {
      setLoading(false);
      setPinAlertOpen(true);
      return;
    }

    try {
      const payload = {
        user_id: userId,
        login_id: values.clubId,
        password: Number(values.pin),
        user_type: "sub_admin",
        name: values.adminName,
        sport_name: values.sportsName,
      };

      const res = await postRequest("/app/user/create", payload);


   // Login PIN Exist popup
if (
  res?.status === 400 &&
  res?.error_message === "Login pin Exist!"
) {
  setLoginPinExistAlert(true);
  return;
}


      if (res?.status === false) {
        setErrorMessage(res?.message || "Section-admin creation failed");
      } else {
       
        await fetchSubAdmins();

        setSuccessDialog(true);
        form.reset({
          adminName: "",
          sportsName: "",
          pin: "",
          clubId: clubIdFixed,
        });
        setPinDigits(["", "", "", ""]);
      }
    } catch (err) {
      setErrorMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  /* --------- TABLE PAGINATION --------- */
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + rowsPerPage);

  /* --------- EDIT / DELETE HANDLERS --------- */
  const handleEdit = (item) => {
    setSelectedAdmin(item);
    setIsDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!selectedAdmin?.id) {
      toast.error("Missing admin id");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        id: selectedAdmin.id,
        name: selectedAdmin.adminName,
        sport_name: selectedAdmin.sportsName,
        password: Number(selectedAdmin.pin),
      };

      const res = await postRequest("/app/user/update", payload);

      if (res?.status === 200 || res?.status === true) {
        //  update UI after success
        setData((prev) =>
          prev.map((i) =>
            i.id === selectedAdmin.id ? { ...selectedAdmin } : i,
          ),
        );

        setIsDrawerOpen(false);
      } else {
        toast.error(res?.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Update API error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col px-4 py-10 justify-center md:flex-row gap-8 items-center md:items-stretch bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] min-h-screen">
      {/* LEFT - TABLE */}
      <Card className="md:w-1/2 w-full rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg text-white">
        <div className="px-6 py-3 border-b border-white/20 flex justify-between ">
          <span className="text-sm tracking-widest font-bold">
            Section Admin List
          </span>
          <span className="text-sm tracking-widest font-bold">
            Club Id: {clubIdFixed}
          </span>
        </div>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className=" rounded-md hover:bg-transparent transition text-md">
                <TableHead className="text-white font-semibold">#</TableHead>
                <TableHead className="text-white font-semibold">
                  Section-admin
                </TableHead>
                {/* <TableHead className="text-white font-semibold">ClubId</TableHead> */}
                <TableHead className="text-white font-semibold">
                  Section Name
                </TableHead>
                <TableHead className="text-white font-semibold">PIN</TableHead>
                <TableHead className="text-white font-semibold">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-slate-300 py-6"
                  >
                    No Section admin created
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, i) => (
                  <TableRow
                    key={i}
                    className="hover:bg-[#155DFC]/20 transition"
                  >
                    <TableCell>{startIndex + i + 1}</TableCell>
                    <TableCell>{item.adminName}</TableCell>
                    {/* <TableCell>{item.clubId}</TableCell> */}
                    <TableCell>{item.sportsName}</TableCell>
                    <TableCell className="font-mono">{item.pin}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        onClick={() => handleEdit(item)}
                        className="bg-blue-600 hover:bg-blue-500 cursor-pointer text-white px-6 py-1 rounded"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(item)}
                        className="bg-red-600 hover:bg-red-500 cursor-pointer text-white px-3 py-1 rounded"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data.length > rowsPerPage && (
            <div className="flex justify-between mt-4">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="bg-teal-800 hover:bg-teal-700 cursor-pointer"
              >
                Prev
              </Button>
              <span className="self-center text-sm">
                Page {currentPage} / {totalPages}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                className="bg-teal-800 hover:bg-teal-700 cursor-pointer"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RIGHT - CREATE FORM */}
      <Card className="md:w-1/2 w-full rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-extrabold tracking-wide">
            Generate Section Admin Club ID
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                name="adminName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section admin Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-10 bg-white text-black font-bold rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="sportsName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-10 bg-white text-black font-bold rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="clubId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Club ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className="h-10 bg-slate-200 text-black rounded-xl font-bold"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>4 Digit PIN</FormLabel>
                <div className="flex gap-2">
                  {pinDigits.map((d, i) => (
                    <Input
                      key={i}
                      id={`pin-${i}`}
                      maxLength={1}
                      value={d}
                      onChange={(e) => handlePinChange(i, e.target.value)}
                      className="w-12 h-12 text-center text-black bg-white rounded-xl text-xl font-bold"
                    />
                  ))}
                </div>
              </FormItem>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-teal-800 hover:bg-teal-700 shadow-lg"
              >
                {loading ? "Creating..." : "Generate Section Admin"}
              </Button>
              {errorMessage && (
                <p className="text-center text-red-400 text-sm">
                  {errorMessage}
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* EDIT DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-lg transform transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"} z-50`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Edit Section Admin</h2>
            <Button
              onClick={() => setIsDrawerOpen(false)}
              className="bg-red-500 h-8 w-8 rounded-full hover:bg-red-600 text-white px-2 py-1 cursor-pointer"
            >
              X
            </Button>
          </div>

          {selectedAdmin && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Admin Name
                </label>
                <input
                  type="text"
                  value={selectedAdmin.adminName}
                  onChange={(e) =>
                    setSelectedAdmin({
                      ...selectedAdmin,
                      adminName: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Section Name
                </label>
                <input
                  type="text"
                  value={selectedAdmin.sportsName}
                  onChange={(e) =>
                    setSelectedAdmin({
                      ...selectedAdmin,
                      sportsName: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>


              <div>
                <label className="block text-sm font-medium mb-1">PIN</label>
                <input
                  type="text"
                  value={selectedAdmin.pin}
                  onChange={(e) =>
                    setSelectedAdmin({ ...selectedAdmin, pin: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 font-mono"
                  maxLength={4}
                  pattern="\d{4}"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-800 hover:bg-blue-700 cursor-pointer text-white px-4 py-2 rounded mt-auto"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* OVERLAY */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}

      {/* SUCCESS DIALOG */}
      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent className="text-center">
          <DialogHeader>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>
              Sub Admin created successfully
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setSuccessDialog(false)}
              className="w-full bg-teal-800"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PIN ALERT */}
      <AlertDialog open={pinAlertOpen} onOpenChange={setPinAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Duplicate PIN
            </AlertDialogTitle>
            <AlertDialogDescription>
              This PIN has already been assigned to another sub-admin. Please
              use a different 4-digit PIN.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Do you really want to delete this sub-admin? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                className="bg-red-600 hover:bg-red-700 flex-1"
                onClick={handleConfirmDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Confirm"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>



      {/* LOGIN PIN EXIST ALERT */}
<AlertDialog
  open={loginPinExistAlert}
  onOpenChange={setLoginPinExistAlert}
>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle className="text-red-600">
        Duplicate PIN
      </AlertDialogTitle>

      <AlertDialogDescription>
        This PIN already exists. Please choose a different 4-digit PIN.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
        OK
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </div>
  );
}
