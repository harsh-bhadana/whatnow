"use client";

import { useEffect, useState } from "react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
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
    <div className="flex-1 bg-[var(--color-m3-background)] flex flex-col items-center justify-center p-6">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl px-4 w-full">
          <AnimatePresence>
            {profiles.map((profile, i) => (
              <motion.button
                key={profile._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectProfile(profile)}
                className="flex flex-col items-center group w-full outline-none"
              >
                <div className={`w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full ${profile.color} shadow-sm group-hover:shadow-xl flex items-center justify-center mb-6 transition-all duration-300 group-focus-visible:ring-4 ring-[var(--color-m3-primary)] ring-offset-4 ring-offset-[var(--color-m3-background)]`}>
                  <span className="text-white text-4xl md:text-5xl font-heading font-medium uppercase tracking-wider">
                    {profile.name.charAt(0)}
                  </span>
                </div>
                <span className="text-xl font-medium text-[var(--color-m3-on-surface)] group-hover:text-[var(--color-m3-primary)] transition-colors truncate w-full text-center">
                  {profile.name}
                </span>
              </motion.button>
            ))}
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center w-full"
            >
              {!showAdd ? (
                <button
                  onClick={() => setShowAdd(true)}
                  className="flex flex-col items-center group w-full outline-none"
                >
                  <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-[var(--color-m3-surface-container-high)] text-[var(--color-m3-on-surface-variant)] shadow-sm group-hover:shadow-md flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-[var(--color-m3-surface-container-highest)] group-focus-visible:ring-4 ring-[var(--color-m3-primary)] ring-offset-4 ring-offset-[var(--color-m3-background)]">
                    <Plus className="w-10 h-10 md:w-12 md:h-12" />
                  </div>
                  <span className="text-xl font-medium text-[var(--color-m3-on-surface-variant)] group-hover:text-[var(--color-m3-on-surface)] transition-colors truncate w-full text-center">
                    Add Profile
                  </span>
                </button>
              ) : (
                <form 
                  onSubmit={handleAddProfile}
                  className="w-full flex flex-col items-center"
                >
                  <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-[var(--color-m3-surface-container-high)] flex items-center justify-center mb-6 p-4 shadow-inner relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-m3-primary)] transform origin-left scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300" />
                    <input
                      autoFocus
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Name"
                      className="w-full bg-transparent text-center text-xl font-medium text-[var(--color-m3-on-surface)] outline-none placeholder:text-[var(--color-m3-on-surface-variant)]/50"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-full hover:bg-[var(--color-m3-surface-variant)] text-sm font-medium text-[var(--color-m3-on-surface-variant)] transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-full bg-[var(--color-m3-primary)] hover:bg-[var(--color-m3-primary)]/90 text-sm font-medium text-[var(--color-m3-on-primary)] transition-colors shadow-sm">Save</button>
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
