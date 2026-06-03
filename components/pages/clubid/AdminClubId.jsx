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

import { CheckCircle2, X } from "lucide-react";

/* ---------------- ZOD SCHEMA ---------------- */
const formSchema = z.object({
  adminName: z
    .string()
    .min(2, "Admin name is required")
    .max(20, "Admin name must be at most 20 characters"),
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
        password: String(values.pin),
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
        password: String(selectedAdmin.pin),
      };

      const res = await postRequest("/app/user/update", payload);

      // Handle duplicate PIN/login error
      if (
        res?.status === 400 &&
        (res?.error_message === "Login pin Exist!" || res?.error_message === "Login PIN Exist!" || res?.error_message === "Login Id Exist!")
      ) {
        setLoginPinExistAlert(true);
        return;
      }

      if ((res?.status === 200 || res?.status === true) && !res?.error_message) {
        //  update UI after success
        setData((prev) =>
          prev.map((i) =>
            i.id === selectedAdmin.id ? { ...selectedAdmin } : i,
          ),
        );

        setIsDrawerOpen(false);
      } else {
        toast.error(res?.error_message || res?.message || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Update API error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col px-4 pt-10 pb-28 justify-center md:flex-row gap-8 items-center md:items-stretch transition-all duration-300">
      {/* LEFT - TABLE */}
      <Card className="md:w-1/2 w-full rounded-3xl border border-border bg-card backdrop-blur-xl shadow-lg text-foreground transition-all duration-300">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <span className="text-sm tracking-widest font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Sporting Sections or Coaching Group List
          </span>
          <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            Club Id: {clubIdFixed}
          </span>
        </div>

        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent transition text-md">
                <TableHead className="text-muted-foreground font-semibold">#</TableHead>
                <TableHead className="text-muted-foreground font-semibold">
                  Section-admin
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold">
                  Sporting Sections or Coaching Group Name
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold">PIN</TableHead>
                <TableHead className="text-muted-foreground font-semibold">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-6"
                  >
                    No Section admin created
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, i) => (
                  <TableRow
                    key={i}
                    className="border-b border-border/50 hover:bg-primary/5 transition text-foreground"
                  >
                    <TableCell className="font-semibold">{startIndex + i + 1}</TableCell>
                    <TableCell className="font-semibold">{item.adminName}</TableCell>
                    <TableCell className="font-semibold">{item.sportsName}</TableCell>
                    <TableCell className="font-mono font-semibold">{item.pin}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        onClick={() => handleEdit(item)}
                        className="bg-primary hover:bg-primary/90 text-white rounded-xl px-4 py-1 text-xs transition duration-200"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(item)}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-4 py-1 text-xs transition duration-200"
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
            <div className="flex justify-between mt-6">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-foreground border border-border rounded-xl cursor-pointer transition duration-200"
              >
                Prev
              </Button>
              <span className="self-center text-sm font-semibold text-muted-foreground">
                Page {currentPage} / {totalPages}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                className="bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-foreground border border-border rounded-xl cursor-pointer transition duration-200"
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RIGHT - CREATE FORM */}
      <Card className="md:w-1/2 w-full rounded-3xl border border-border bg-card backdrop-blur-xl shadow-lg text-foreground transition-all duration-300">
        <CardHeader className="text-center">
          <CardTitle className="text-md font-extrabold tracking-wide bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Generate Section Admin Club ID or Coaching Group ID
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
                    <FormLabel className="text-muted-foreground font-semibold">Section Admin or Coach Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        maxLength={20}
                        className="h-10 bg-slate-50 dark:bg-white/5 border border-border text-foreground font-bold rounded-xl focus:border-primary transition-all duration-200"
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
                    <FormLabel className="text-muted-foreground font-semibold">Sporting Section or Coaching Group Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-10 bg-slate-50 dark:bg-white/5 border border-border text-foreground font-bold rounded-xl focus:border-primary transition-all duration-200"
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
                    <FormLabel className="text-muted-foreground font-semibold">Club or Coach ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className="h-10 bg-slate-100 dark:bg-white/10 border border-border text-muted-foreground rounded-xl font-bold cursor-not-allowed opacity-75"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel className="text-muted-foreground font-semibold">4 Digit PIN</FormLabel>
                <div className="flex gap-2 pt-1">
                  {pinDigits.map((d, i) => (
                    <Input
                      key={i}
                      id={`pin-${i}`}
                      maxLength={1}
                      value={d}
                      onChange={(e) => handlePinChange(i, e.target.value)}
                      className="w-12 h-12 text-center text-foreground bg-slate-50 dark:bg-white/5 border border-border rounded-xl text-xl font-bold focus:border-primary transition-all duration-200"
                    />
                  ))}
                </div>
              </FormItem>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white shadow-lg shadow-primary/20 transition-all duration-200"
              >
                {loading ? "Creating..." : "Generate Section Admin"}
              </Button>
              {errorMessage && (
                <p className="text-center text-red-500 font-semibold text-sm">
                  {errorMessage}
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* EDIT DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl transform transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"} z-50 text-foreground`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Edit Section Admin</h2>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="bg-primary/10 hover:bg-primary/20 text-primary h-8 w-8 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {selectedAdmin && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="flex flex-col gap-6 h-full"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    value={selectedAdmin.adminName}
                    maxLength={20}
                    onChange={(e) =>
                      setSelectedAdmin({
                        ...selectedAdmin,
                        adminName: e.target.value.slice(0, 20),
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl px-3 py-2 text-foreground focus:border-primary focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">
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
                    className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl px-3 py-2 text-foreground focus:border-primary focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-1">PIN</label>
                  <input
                    type="text"
                    value={selectedAdmin.pin}
                    onChange={(e) =>
                      setSelectedAdmin({ ...selectedAdmin, pin: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-white/5 border border-border rounded-xl px-3 py-2 text-foreground font-mono focus:border-primary focus:outline-none transition-all"
                    maxLength={4}
                    pattern="\d{4}"
                    required
                  />
                </div>
                 <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl mt-auto shadow-lg transition duration-200"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* OVERLAY */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}

      {/* SUCCESS DIALOG */}
      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent className="text-center bg-card text-foreground border-border shadow-2xl rounded-2xl p-6 transition-all duration-300">
          <DialogHeader>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 animate-bounce" />
            <DialogTitle className="text-foreground">Success</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Sub Admin created successfully
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setSuccessDialog(false)}
              className="w-full bg-primary hover:bg-primary/95 text-white rounded-xl h-11 transition-all"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PIN ALERT */}
      <AlertDialog open={pinAlertOpen} onOpenChange={setPinAlertOpen}>
        <AlertDialogContent className="bg-card text-foreground border-border shadow-2xl rounded-2xl p-6 transition-all duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 font-bold">
              Duplicate PIN
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This PIN has already been assigned to another sub-admin. Please
              use a different 4-digit PIN.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-primary text-white hover:bg-primary/95 rounded-xl px-4 py-2 transition-all">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE CONFIRM */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card text-foreground border-border shadow-2xl rounded-2xl p-6 transition-all duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 font-bold">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Do you really want to delete this sub-admin? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="flex-1 border border-border bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-foreground rounded-xl h-11 transition-all">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white flex-1 rounded-xl h-11 transition-all"
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
        <AlertDialogContent className="bg-card text-foreground border-border shadow-2xl rounded-2xl p-6 transition-all duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 font-bold">
              Duplicate PIN
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This PIN already exists. Please choose a different 4-digit PIN.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-primary text-white hover:bg-primary/95 rounded-xl px-4 py-2 transition-all">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
