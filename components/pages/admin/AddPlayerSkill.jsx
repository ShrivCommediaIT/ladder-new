// AddPlayerSkill.jsx - SUCCESS DIALOG + INSTANT REFRESH
import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, Phone, User } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

const APPKEY = "Py9YJXgBecbbqxjRVaHarcSnJyuzhxGqJTkY6xKZRfrdXFy72HPXvFRvfEjy";

//  SUCCESS DIALOG
const SuccessDialog = ({ playerName, ladderId, onCloseAll }) => (
  <Dialog open={true} onOpenChange={() => {}}>
    <DialogContent className="sm:max-w-md bg-gradient-to-br from-green-500/10 to-emerald-500/10 
                              border-2 border-green-500/30 backdrop-blur-sm rounded-2xl">
      <DialogHeader>
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="w-20 h-20 bg-green-500/20 rounded-2xl flex items-center justify-center border-4 border-green-500/50">
            <CheckCircle className="w-12 h-12 text-green-300 animate-bounce" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white text-center">
            Player Added Successfully!
          </DialogTitle>
          <DialogDescription className="text-center text-green-100">
            <strong>{playerName}</strong> has been added to Skill LeaderBoard
          </DialogDescription>
        </div>
      </DialogHeader>
      <DialogFooter className="sm:justify-center gap-3">
        <Button
          onClick={onCloseAll}
          className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg w-full sm:w-auto"
        >
          Close & Refresh
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const AddPlayerSkill = ({ ladderId, onClose, onSuccessRefresh }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Player name is required!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://ne-games.com/leaderBoard/api/user/adduserskillboard",
        null,
        {
          params: {
            ladder_id: ladderId,
            name: formData.name.trim(),
            phone: formData.phone.trim() || undefined,
          },
          headers: {
            APPKEY: APPKEY,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.status === 200) {
        // SUCCESS DIALOG SHOW
        setSuccessData({
          playerName: formData.name.trim(),
          ladderId,
        });
        setShowSuccess(true);
        
        // Reset form
        setFormData({ name: "", phone: "" });
        
        // Toast notification
        // toast.success("Player added successfully! 🎉", {
        //   position: "top-right",
        //   autoClose: 3000,
        // });
        
        // Callback for parent refresh
        onSuccessRefresh?.();
      } else {
        throw new Error(response.data?.message || "Failed to add player");
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to add player. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // CLOSE ALL MODALS + REFRESH
  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose?.(); // Close add player dialog
    // Parent will handle leaderboard refresh
  };

  // Show error dialog
  if (showSuccess) {
    return <SuccessDialog {...successData} onCloseAll={handleSuccessClose} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6" />
          Add Skill Player
        </h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-2">
        <label className="text-white font-semibold flex items-center gap-2">
          <User className="w-4 h-4" />
          Player Name *
        </label>
        <input
          type="text"
          name="name"
          placeholder="Enter player full name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-400 
                     focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 focus:outline-none transition-all"
        />
      </div>

      {/* Phone Field */}
      <div className="space-y-2">
        <label className="text-white font-semibold flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Phone Number
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">+91</div>
          <input
            type="number"
            name="phone"
            placeholder="Enter your phone number (Optional)"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full pl-16 p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-400 
                       focus:border-teal-400 focus:ring-2 focus:ring-teal-400/50 focus:outline-none transition-all"
          />
        </div>
        <p className="text-xs text-gray-500">Enter 10-digit number (optional)</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          disabled={loading}
          className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !formData.name.trim()}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg disabled:opacity-50"
        >
          {loading ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Player"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddPlayerSkill;
