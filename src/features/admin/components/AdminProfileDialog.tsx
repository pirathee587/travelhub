import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Trash2, LogOut, Settings, X, Eye, EyeOff } from "lucide-react";
import { useModal } from "./ModalContext";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// ─── Helper ─────────────────────────────────────────────
function getInitials(name: string) {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("");
}

export default function AdminProfileDialog({ isSidebar }: { isSidebar?: boolean }) {
  const navigate = useNavigate();
  const modalContext = useModal();
  const { logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Profile state
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    avatarUrl: string | undefined;
  }>({
    name: "Super Admin",
    email: "admin@travelhub.com",
    avatarUrl: undefined,
  });
  const [draftName, setDraftName] = useState(profile.name);
  const [draftEmail, setDraftEmail] = useState(profile.email);
  const [draftAvatar, setDraftAvatar] = useState<string | undefined>(profile.avatarUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  // Password state
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ─── Logout ───────────────────────────────────────────
  function handleLogout() {
    logout();
    toast.success("Logged out successfully.");
    navigate("/");
  }

  // ─── Image Upload ─────────────────────────────────────
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("Max file size is 1MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setDraftAvatar(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setDraftAvatar(undefined);
    if (fileRef.current) fileRef.current.value = "";
  }

  // ─── Save Profile ─────────────────────────────────────
  function saveProfile() {
    if (!draftName.trim()) {
      toast.error("Full name is required.");
      return;
    }
    setProfile({ name: draftName, email: draftEmail, avatarUrl: draftAvatar });
    toast.success("Profile updated!");
    setOpen(false);
  }

  // ─── Save Password ────────────────────────────────────
  function savePassword() {
    if (!oldPass || !newPass || !confirmPass) {
      toast.error("All fields are required.");
      return;
    }
    if (newPass !== confirmPass) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPass.length < 8) {
      toast.error("Minimum 8 characters required.");
      return;
    }
    toast.success("Password changed!");
    setOldPass(""); setNewPass(""); setConfirmPass("");
    setOpen(false);
  }

  const strength = (val: string) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const map: Record<number, { label: string; color: string }> = {
      1: { label: "Weak", color: "#e24b4a" },
      2: { label: "Fair", color: "#ef9f27" },
      3: { label: "Good", color: "#1d9e75" },
      4: { label: "Strong", color: "#1d9e75" },
    };
    return map[score] ?? null;
  };

  const str = strength(newPass);
  const strengthIndex = ["Weak", "Fair", "Good", "Strong"].indexOf(str?.label) + 1;
  const passwordsMatch = confirmPass && newPass === confirmPass;

  const handleOpen = () => {
    setOpen(true);
    setDraftName(profile.name);
    setDraftEmail(profile.email);
    setDraftAvatar(profile.avatarUrl);
  };

  return (
    <>
      {/* ── Trigger ── */}
      {isSidebar ? (
        <button
          onClick={handleOpen}
          className="flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition hover:bg-teal-800 hover:bg-opacity-30 w-full text-left"
        >
          <div className="text-2xl text-teal-50"><Settings size={24} /></div>
          <div className="text-lg font-medium text-teal-50">Settings</div>
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-2.5 rounded-md transition-colors font-medium"
        >
          <Settings size={18} className="text-gray-500" />
          Settings
        </button>
      )}

      {/* ── Dialog ── */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 pt-5 pb-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-lg font-semibold text-gray-900">Edit profile</p>
                <div className="flex items-center gap-2">
                  {!showLogoutConfirm ? (
                    <button
                      className="text-red-600 hover:bg-red-50 flex items-center gap-1.5 h-8 px-2 rounded-md text-sm font-medium transition-colors"
                      onClick={() => setShowLogoutConfirm(true)}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                      <span className="text-xs text-red-800 font-medium">Sure?</span>
                      <button
                        className="h-7 text-xs px-3 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                        onClick={handleLogout}
                      >
                        Yes
                      </button>
                      <button
                        className="h-7 text-xs px-2 text-gray-600 hover:bg-gray-200 rounded font-medium"
                        onClick={() => setShowLogoutConfirm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {!showLogoutConfirm && (
                    <button
                      onClick={() => setOpen(false)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors ml-2"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                {["profile", "password"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-sm px-4 py-3 capitalize border-b-2 transition-colors -mb-px font-medium ${
                      activeTab === tab
                        ? "border-teal-600 text-teal-700"
                        : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
              {activeTab === "profile" && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-5 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full overflow-hidden bg-teal-100 text-teal-800 flex items-center justify-center border-2 border-dashed border-teal-300">
                        {draftAvatar ? (
                          <img src={draftAvatar} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold">{getInitials(draftName) || "SA"}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-teal-600 text-white flex items-center justify-center border-2 border-white hover:scale-110 transition-transform shadow-sm"
                      >
                        <Camera className="h-3.5 w-3.5" />
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">Profile photo</p>
                      <p className="text-xs text-gray-500 mb-2.5">JPG, PNG — max 1MB</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
                          onClick={() => fileRef.current?.click()}
                        >
                          Upload
                        </button>
                        {draftAvatar && (
                          <button
                            type="button"
                            className="flex items-center px-3 py-1.5 border border-red-200 text-red-600 bg-red-50 rounded-md text-xs font-medium hover:bg-red-100 transition-colors"
                            onClick={removePhoto}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Full name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="Super Admin"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={draftEmail}
                      onChange={(e) => setDraftEmail(e.target.value)}
                      placeholder="admin@travelhub.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow text-sm"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                    <button
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-sm transition-colors"
                      onClick={saveProfile}
                    >
                      Save changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "password" && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Old password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type={showOld ? "text" : "password"}
                        value={oldPass}
                        onChange={(e) => setOldPass(e.target.value)}
                        placeholder="Enter old password"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOld(!showOld)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">New password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="Min 8 characters"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {newPass && (
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="flex-1 h-1.5 rounded-full transition-all duration-300"
                              style={{
                                background: i <= strengthIndex ? str?.color : "#e5e7eb",
                              }}
                            />
                          ))}
                        </div>
                        {str && (
                          <p className="text-xs font-medium mt-1" style={{ color: str.color }}>
                            {str.label}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Confirm password <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPass && (
                      <p className="text-xs font-medium mt-1" style={{ color: passwordsMatch ? "#1d9e75" : "#e24b4a" }}>
                        {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                    <button
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-sm transition-colors"
                      onClick={savePassword}
                    >
                      Save changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
