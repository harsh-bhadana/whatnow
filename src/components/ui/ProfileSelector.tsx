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
  const [includeAdult, setIncludeAdult] = useState(false);
  
  const { setActiveProfile, setWatchHistory } = useAppStore();

  useEffect(() => {
    async function fetchProfiles() {
      const data = await getProfiles();
      setProfiles(data);
      setLoading(false);
    }
    fetchProfiles();
  }, []);

  const handleSelectProfile = (profile: Profile) => {
    setActiveProfile(profile._id!, { name: profile.name, color: profile.color, includeAdult: profile.includeAdult });
    setWatchHistory(profile.watchHistory || []);
    router.push("/discover");
  };

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newProfile = await createProfile(newName, randomColor, includeAdult);
    
    if (newProfile) {
      setProfiles([...profiles, newProfile]);
      setShowAdd(false);
      setNewName("");
      setIncludeAdult(false);
    }
  };

  return (
    <>
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
              <button
                onClick={() => setShowAdd(true)}
                className="flex flex-col items-center group w-full outline-none"
              >
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-105 group-focus-visible:scale-105">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[var(--color-m3-surface-container-high)] group-hover:text-[var(--color-m3-surface-container-highest)] fill-current drop-shadow-sm group-hover:drop-shadow-md transition-colors duration-300">
                    <path d="M50.00,0.00 L60.35,11.36 L75.00,6.70 L78.28,21.72 L93.30,25.00 L88.64,39.65 L100.00,50.00 L88.64,60.35 L93.30,75.00 L78.28,78.28 L75.00,93.30 L60.35,88.64 L50.00,100.00 L39.65,88.64 L25.00,93.30 L21.72,78.28 L6.70,75.00 L11.36,60.35 L0.00,50.00 L11.36,39.65 L6.70,25.00 L21.72,21.72 L25.00,6.70 L39.65,11.36 Z" />
                  </svg>
                  <Plus className="relative z-10 w-10 h-10 md:w-12 md:h-12 text-[var(--color-m3-on-surface-variant)] group-hover:text-[var(--color-m3-on-surface)] transition-colors duration-300" />
                </div>
                <span className="text-xl font-medium text-[var(--color-m3-on-surface-variant)] group-hover:text-[var(--color-m3-on-surface)] transition-colors truncate w-full text-center">
                  Add Profile
                </span>
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
      
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[var(--color-m3-surface-container-high)] p-8 md:p-12 rounded-[32px] shadow-2xl max-w-md w-full flex flex-col items-center relative overflow-hidden"
            >
              <h2 className="text-3xl font-heading font-bold text-[var(--color-m3-on-surface)] mb-8">
                New Profile
              </h2>
              
              <form 
                onSubmit={handleAddProfile}
                className="w-full flex flex-col gap-8 mt-4"
              >
                <div className="relative w-full bg-[var(--color-m3-surface-variant)] rounded-t-lg border-b-[1px] border-[var(--color-m3-on-surface-variant)] group focus-within:bg-[var(--color-m3-surface-variant-hover)] transition-colors px-4 pt-6 pb-2">
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-m3-primary)] transform origin-center scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300" />
                  <label className="absolute top-2 left-4 text-xs font-medium text-[var(--color-m3-primary)]">
                    Profile Name
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter Name"
                    className="w-full bg-transparent text-lg text-[var(--color-m3-on-surface)] outline-none placeholder:text-transparent group-focus-within:placeholder:text-[var(--color-m3-on-surface-variant)]/50"
                  />
                </div>

                <div className="flex items-center gap-3 px-2">
                  <input
                    type="checkbox"
                    id="includeAdult"
                    checked={includeAdult}
                    onChange={(e) => setIncludeAdult(e.target.checked)}
                    className="w-5 h-5 rounded-[4px] border-[var(--color-m3-outline)] text-[var(--color-m3-primary)] focus:ring-[var(--color-m3-primary)] bg-transparent cursor-pointer"
                  />
                  <label htmlFor="includeAdult" className="text-sm font-medium text-[var(--color-m3-on-surface)] cursor-pointer">
                    Show Adult Content (18+)
                  </label>
                </div>
                
                <div className="flex gap-4 w-full justify-end mt-2">
                  <button type="button" onClick={() => setShowAdd(false)} className="px-6 py-2.5 rounded-full hover:bg-[var(--color-m3-surface-variant)] text-[var(--color-m3-on-surface-variant)] font-medium transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={!newName.trim()} className="px-6 py-2.5 rounded-full bg-[var(--color-m3-primary)] hover:bg-[var(--color-m3-primary)]/90 text-[var(--color-m3-on-primary)] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Save Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
