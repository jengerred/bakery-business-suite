"use client";

import { useState } from "react";
import { userService } from "../lib/userService";
import { useUser } from "../context/UserContext";

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useUser();

  if (!isOpen) return null;

  // 🔄 Completely resets the modal state
  const handleBack = () => {
    setIsNewUser(false);
    setName("");
    setError("");
  };

  const handleClose = () => {
    handleBack();
    onClose();
  };

  const handleStepOne = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const existing = await userService.find(input.trim());
    
    if (existing) {
      setUser(existing);
      handleClose();
    } else {
      setIsNewUser(true); // User not in Profiles table, trigger sign-up
    }
    setLoading(false);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const isEmail = input.includes("@");
      const newUser = await userService.create({
        name: name || "New Member",
        email: isEmail ? input.trim() : undefined,
        phone: !isEmail ? input.trim() : undefined,
      });

      setUser(newUser);
      handleClose();
    } catch (err) {
      setError("Something went wrong creating your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-stone-100 relative">
        
        {/* ⬅️ Back Button: Only shows on the Name entry screen */}
        {isNewUser && (
          <button 
            onClick={handleBack}
            className="absolute top-6 left-6 text-stone-400 hover:text-violet-600 transition-colors font-bold text-xs uppercase tracking-widest"
          >
            ← Back
          </button>
        )}

        <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tighter italic mb-1 mt-4">
          {isNewUser ? "Join Rewards" : "Mothers Rewards"}
        </h2>
        
        <p className="text-stone-500 text-sm mb-6 leading-tight">
          {isNewUser 
            ? "We didn't find that account. Create one now to earn points!" 
            : "Enter your email or phone to sign in."}
        </p>

        <form onSubmit={isNewUser ? handleCreateAccount : handleStepOne} className="space-y-3">
          {isNewUser && (
            <input
              type="text"
              placeholder="What should we call you?"
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-violet-500 transition-all font-bold"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          
          <input
            type="text"
            placeholder="Email or Phone"
            disabled={isNewUser} // Keeps the identifier locked so they don't change it midway
            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-violet-500 transition-all font-bold disabled:opacity-50"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 text-white font-black py-4 rounded-2xl hover:bg-violet-700 transition-all uppercase tracking-widest shadow-lg shadow-violet-100 disabled:bg-stone-300"
          >
            {loading ? "Working..." : isNewUser ? "Sign Up" : "Continue"}
          </button>
        </form>
        
        {!isNewUser && (
          <button onClick={handleClose} className="w-full mt-4 text-stone-400 text-[10px] uppercase font-bold tracking-widest hover:text-stone-600">
            Maybe Later
          </button>
        )}
      </div>
    </div>
  );
}