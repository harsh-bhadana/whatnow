"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { getProfiles, createProfile, Profile } from "@/app/actions/profiles";
import { useAppStore } from "@/lib/store/useAppStore";

const COLORS = [
  "bg-blue-500", "bg-red-500", "bg-green-500", 
  "bg-yellow-500", "bg-purple-500", "bg-pink-500"
];

export default function ProfileSelector() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  
  const { setActiveProfileId, setWatchHistory } = useAppStore();

  useEffect(() => {
    async function fetchProfiles() {
      const data = await getProfiles();
      setProfiles(data);
      setLoading(false);
    }
    fetchProfiles();
  }, []);

  const handleSelectProfile = (profile: Profile) => {
    setActiveProfileId(profile._id!);
    setWatchHistory(profile.watchHistory || []);
    router.push("/discover");
  };

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newProfile = await createProfile(newName, randomColor);
    
    if (newProfile) {
      setProfiles([...profiles, newProfile]);
      setShowAdd(false);
      setNewName("");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-m3-background)] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-[var(--color-m3-on-background)] mb-4">
          Who&apos;s Watching?
        </h1>
        <p className="text-[var(--color-m3-on-surface-variant)] text-lg">
          Select your profile to continue
        </p>
      </motion.div>

      {loading ? (
        <div className="flex space-x-2">
          <div className="w-4 h-4 bg-[var(--color-m3-primary)] rounded-full animate-bounce" />
          <div className="w-4 h-4 bg-[var(--color-m3-primary)] rounded-full animate-bounce delay-100" />
          <div className="w-4 h-4 bg-[var(--color-m3-primary)] rounded-full animate-bounce delay-200" />
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-8 max-w-4xl">
          <AnimatePresence>
            {profiles.map((profile, i) => (
              <motion.button
                key={profile._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectProfile(profile)}
                className="flex flex-col items-center group"
              >
                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-m3-xl ${profile.color} shadow-lg flex items-center justify-center mb-4 transition-transform group-hover:ring-4 ring-[var(--color-m3-primary)] ring-offset-4 ring-offset-[var(--color-m3-background)]`}>
                  <span className="text-white text-5xl font-heading font-bold uppercase">
                    {profile.name.charAt(0)}
                  </span>
                </div>
                <span className="text-xl font-medium text-[var(--color-m3-on-background)] group-hover:text-[var(--color-m3-primary)] transition-colors">
                  {profile.name}
                </span>
              </motion.button>
            ))}
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {!showAdd ? (
                <button
                  onClick={() => setShowAdd(true)}
                  className="flex flex-col items-center group"
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-m3-xl border-4 border-dashed border-[var(--color-m3-outline)] flex items-center justify-center mb-4 group-hover:border-[var(--color-m3-primary)] transition-colors">
                    <Plus className="w-12 h-12 text-[var(--color-m3-outline)] group-hover:text-[var(--color-m3-primary)] transition-colors" />
                  </div>
                  <span className="text-xl font-medium text-[var(--color-m3-on-background)] group-hover:text-[var(--color-m3-primary)] transition-colors">
                    Add Profile
                  </span>
                </button>
              ) : (
                <form 
                  onSubmit={handleAddProfile}
                  className="w-32 md:w-40 flex flex-col items-center"
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-m3-xl bg-[var(--color-m3-surface-variant)] flex items-center justify-center mb-4 p-4">
                    <input
                      autoFocus
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Name"
                      className="w-full bg-transparent text-center text-xl font-medium text-[var(--color-m3-on-surface)] outline-none border-b-2 border-[var(--color-m3-primary)] pb-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowAdd(false)} className="text-sm text-[var(--color-m3-outline)]">Cancel</button>
                    <button type="submit" className="text-sm text-[var(--color-m3-primary)] font-bold">Save</button>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
