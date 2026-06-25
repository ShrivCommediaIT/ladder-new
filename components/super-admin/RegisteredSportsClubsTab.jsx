"use client";

import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { 
  Building2, 
  CheckCircle2, 
  ShieldAlert, 
  Activity, 
  Clock3, 
  Search, 
  Calendar,
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- DUMMY DATA FOR CLUBS ---
const INITIAL_CLUBS = [
  { id: 1, name: "Apex Tennis Academy", startDate: "2026-01-10", trialEndDate: "2026-02-09", paymentStatus: "Paid", status: "Active" },
  { id: 2, name: "Golden Gate Swim Club", startDate: "2026-02-15", trialEndDate: "2026-03-17", paymentStatus: "Paid", status: "Active" },
  { id: 3, name: "London Fencing Academy", startDate: "2026-03-01", trialEndDate: "2026-03-31", paymentStatus: "Pending", status: "Active" },
  { id: 4, name: "Dublin Rugby Club", startDate: "2026-04-20", trialEndDate: "2026-05-20", paymentStatus: "Trialing", status: "Active" },
  { id: 5, name: "Paris Gymnastics Club", startDate: "2026-05-12", trialEndDate: "2026-06-11", paymentStatus: "Trialing", status: "Inactive" },
  { id: 6, name: "Sydney Cricket Academy", startDate: "2026-06-01", trialEndDate: "2026-07-01", paymentStatus: "Trialing", status: "Active" },
  { id: 7, name: "Madrid Football Club", startDate: "2026-02-28", trialEndDate: "2026-03-30", paymentStatus: "Paid", status: "Inactive" },
  { id: 8, name: "Berlin Basketball Academy", startDate: "2026-03-15", trialEndDate: "2026-04-14", paymentStatus: "Pending", status: "Inactive" },
  { id: 9, name: "Toronto Rowing Club", startDate: "2026-05-25", trialEndDate: "2026-06-24", paymentStatus: "Trialing", status: "Active" },
  { id: 10, name: "Tokyo Karate Dojo", startDate: "2026-06-15", trialEndDate: "2026-07-15", paymentStatus: "Trialing", status: "Active" },
  { id: 11, name: "New York Baseball Club", startDate: "2026-01-05", trialEndDate: "2026-02-04", paymentStatus: "Paid", status: "Active" },
  { id: 12, name: "Chicago Athletics Club", startDate: "2026-04-05", trialEndDate: "2026-05-05", paymentStatus: "Pending", status: "Active" }
];

export default function RegisteredSportsClubsTab() {
  // --- DASHBOARD STATES ---
  const [clubs, setClubs] = useState(INITIAL_CLUBS);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterActive, setFilterActive] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");

  // --- INTERACTIVE ACTIONS FOR CLUBS ---
  const toggleActivation = (id) => {
    setClubs(prev => prev.map(club => {
      if (club.id === id) {
        const nextStatus = club.status === "Active" ? "Inactive" : "Active";
        toast.success(`"${club.name}" is now ${nextStatus}`);
        return { ...club, status: nextStatus };
      }
      return club;
    }));
  };

  const extendTrial = (id) => {
    setClubs(prev => prev.map(club => {
      if (club.id === id) {
        const currentEnd = new Date(club.trialEndDate);
        currentEnd.setDate(currentEnd.getDate() + 30);
        const newEndDate = currentEnd.toISOString().split('T')[0];
        toast.success(`Extended trial for "${club.name}" by 30 days! 📅`);
        return { ...club, trialEndDate: newEndDate };
      }
      return club;
    }));
  };

  const markAsPaid = (id) => {
    setClubs(prev => prev.map(club => {
      if (club.id === id) {
        toast.success(`"${club.name}" marked as Paid successfully! 💰`);
        return { ...club, paymentStatus: "Paid" };
      }
      return club;
    }));
  };

  // --- METRICS CALCULATION ---
  const metrics = useMemo(() => {
    const total = clubs.length;
    const active = clubs.filter(c => c.status === "Active").length;
    const inactive = total - active;
    const paid = clubs.filter(c => c.paymentStatus === "Paid").length;
    const trialing = clubs.filter(c => c.paymentStatus === "Trialing").length;
    return { total, active, inactive, paid, trialing };
  }, [clubs]);

  // --- FILTER & SEARCH LOGIC ---
  const filteredClubs = useMemo(() => {
    return clubs.filter(club => {
      const matchName = club.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
      
      let matchDate = true;
      if (startDate) {
        matchDate = matchDate && new Date(club.startDate) >= new Date(startDate);
      }
      if (endDate) {
        matchDate = matchDate && new Date(club.startDate) <= new Date(endDate);
      }

      const matchActive = filterActive === "All" || club.status === filterActive;
      const matchPayment = filterPayment === "All" || club.paymentStatus === filterPayment;

      return matchName && matchDate && matchActive && matchPayment;
    });
  }, [clubs, searchTerm, startDate, endDate, filterActive, filterPayment]);

  const hasActiveFilters = searchTerm || startDate || endDate || filterActive !== "All" || filterPayment !== "All";

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setFilterActive("All");
    setFilterPayment("All");
    toast.info("Filters cleared");
  };

  return (
    <div className="space-y-8">
      {/* Metrics Panels */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Clubs</span>
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight">{metrics.total}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Platform Registers</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Clubs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight text-emerald-500">{metrics.active}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Active Accounts</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Inactive Clubs</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight text-rose-500">{metrics.inactive}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Deactivated Accounts</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Paid Accounts</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight text-blue-500">{metrics.paid}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Active Subscriptions</p>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3 text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Trial Accounts</span>
            <Clock3 className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight text-amber-500">{metrics.trialing}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Free Trial Users</p>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            <span>Filter & Search Controls</span>
          </h3>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              className="h-8 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider rounded-lg px-3.5 cursor-pointer shadow-md shadow-red-500/20 border-0 transition-all duration-200"
            >
              Clear Filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Name Search */}
          <div className="space-y-1.5 col-span-1 md:col-span-2 lg:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Search Club</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-9 ${searchTerm ? "pr-9" : ""} h-10 bg-muted border-input text-foreground rounded-xl text-sm w-full`}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-0.5 rounded-full hover:bg-card/50"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Registered After</span>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-9 h-10 bg-muted border-input text-foreground rounded-xl text-sm"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Registered Before</span>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-9 h-10 bg-muted border-input text-foreground rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Active Status dropdown */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Activation State</span>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full h-10 bg-muted border border-input rounded-xl px-3 text-sm text-foreground focus:ring-1 focus:ring-primary focus-visible:ring-1 focus-visible:ring-primary outline-none"
            >
              <option value="All" className="bg-card text-foreground">All States</option>
              <option value="Active" className="bg-card text-foreground">Active</option>
              <option value="Inactive" className="bg-card text-foreground">Inactive</option>
            </select>
          </div>

          {/* Payment Status dropdown */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment Status</span>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full h-10 bg-muted border border-input rounded-xl px-3 text-sm text-foreground focus:ring-1 focus:ring-primary focus-visible:ring-1 focus-visible:ring-primary outline-none"
            >
              <option value="All" className="bg-card text-foreground">All Payments</option>
              <option value="Paid" className="bg-card text-foreground">Paid</option>
              <option value="Pending" className="bg-card text-foreground">Pending</option>
              <option value="Trialing" className="bg-card text-foreground">Trialing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clubs List Table */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
            Registered Sports Clubs ({filteredClubs.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-border/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">
                <th className="px-6 py-4">Club Name</th>
                <th className="px-6 py-4">Starting Date</th>
                <th className="px-6 py-4">Trial End Date</th>
                <th className="px-6 py-4">Payment Status</th>
                <th className="px-6 py-4">Activation</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredClubs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 font-bold text-muted-foreground">
                    No clubs match the active filters
                  </td>
                </tr>
              ) : (
                filteredClubs.map(club => (
                  <tr key={club.id} className="hover:bg-muted/10 transition-colors">
                    {/* Club Name */}
                    <td className="px-6 py-4.5 font-semibold text-sm text-foreground">
                      {club.name}
                    </td>
                    {/* Start Date */}
                    <td className="px-6 py-4.5 text-xs font-semibold text-muted-foreground">
                      {club.startDate}
                    </td>
                    {/* Trial End Date */}
                    <td className="px-6 py-4.5 text-xs font-semibold text-muted-foreground">
                      {club.trialEndDate}
                    </td>
                    {/* Payment Status */}
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        club.paymentStatus === "Paid"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : club.paymentStatus === "Pending"
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          club.paymentStatus === "Paid"
                            ? "bg-emerald-500"
                            : club.paymentStatus === "Pending"
                            ? "bg-rose-500"
                            : "bg-amber-500"
                        }`}></span>
                        <span>{club.paymentStatus}</span>
                      </span>
                    </td>
                    {/* Activation Status */}
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        club.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          club.status === "Active" ? "bg-emerald-500" : "bg-gray-500"
                        }`}></span>
                        <span>{club.status}</span>
                      </span>
                    </td>
                    {/* Action Buttons */}
                    <td className="px-6 py-4.5 text-right space-x-1.5 whitespace-nowrap">
                      {/* Toggle Activation (Always available) */}
                      <Button
                        onClick={() => toggleActivation(club.id)}
                        variant="outline"
                        size="sm"
                        className={`h-8 px-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-colors cursor-pointer ${
                          club.status === "Active"
                            ? "border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500"
                            : "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500"
                        }`}
                      >
                        {club.status === "Active" ? "Deactivate" : "Activate"}
                      </Button>

                      {/* Mark as Paid (Only when Pending or Trialing) */}
                      {club.paymentStatus !== "Paid" && (
                        <Button
                          onClick={() => markAsPaid(club.id)}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary transition-colors cursor-pointer"
                        >
                          Mark Paid
                        </Button>
                      )}

                      {/* Extend Trial (Only when Trialing or Pending) */}
                      {club.paymentStatus !== "Paid" && (
                        <Button
                          onClick={() => extendTrial(club.id)}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 hover:border-indigo-500 transition-colors cursor-pointer"
                        >
                          Extend 30 Days
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
