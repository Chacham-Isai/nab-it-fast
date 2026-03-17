import { useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { xpProgress } from "@/lib/xp";

interface ProfileHeroProps {
  avatarEmoji: string;
  displayName: string;
  email?: string;
  bio: string;
  totalXp: number;
  streakDays: number;
  personalityTag: string;
  memberSince: string;
  editing: boolean;
  onNameChange: (name: string) => void;
  onBioChange: (bio: string) => void;
  onSave: () => void;
}

const ProfileHero = ({
  avatarEmoji, displayName, email, bio, totalXp, streakDays,
  personalityTag, memberSince, editing, onNameChange, onBioChange, onSave,
}: ProfileHeroProps) => {
  const xp = xpProgress(totalXp);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center space-y-3">
      <div className="relative">
        <motion.div
          animate={{ boxShadow: ["0 0 20px hsl(var(--primary)/0.2)", "0 0 40px hsl(var(--primary)/0.35)", "0 0 20px hsl(var(--primary)/0.2)"] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30 flex items-center justify-center text-4xl"
        >
          {avatarEmoji}
        </motion.div>
        <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black">
          LVL {xp.level}
        </div>
        {streakDays > 0 && (
          <div className="absolute -bottom-1 -left-1 px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-black flex items-center gap-0.5">
            🔥 {streakDays}
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-2 w-full max-w-[260px]">
          <Input value={displayName} onChange={(e) => onNameChange(e.target.value)} onBlur={onSave}
            className="text-center bg-secondary/30 border-border/50 rounded-xl font-heading font-bold" autoFocus />
          <Input value={bio} onChange={(e) => onBioChange(e.target.value)} onBlur={onSave}
            placeholder="Short bio..." className="text-center text-xs bg-secondary/30 border-border/50 rounded-xl" />
        </div>
      ) : (
        <>
          <h2 className="font-heading font-black text-foreground text-xl">{displayName}</h2>
          {bio && <p className="text-xs text-muted-foreground max-w-[240px]">{bio}</p>}
        </>
      )}

      {email && <span className="text-[10px] text-muted-foreground/60">{email}</span>}

      {personalityTag && (
        <motion.span
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="text-xs font-black uppercase tracking-widest bg-clip-text text-transparent flex items-center gap-1"
          style={{ backgroundImage: "linear-gradient(90deg, hsl(var(--nab-cyan)), hsl(var(--primary)), hsl(var(--nab-blue)), hsl(var(--nab-cyan)))", backgroundSize: "200% 100%" }}
        >
          <Sparkles className="w-3 h-3 text-primary" /> {personalityTag}
        </motion.span>
      )}

      {/* XP Bar */}
      <div className="w-full max-w-[280px] space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
          <span>{totalXp.toLocaleString()} XP</span>
          <span>Level {xp.level + 1}: {xp.needed - xp.current} XP left</span>
        </div>
        <Progress value={xp.percent} className="h-2 bg-secondary/50" />
      </div>

      <span className="text-[10px] text-muted-foreground/50">Member since {memberSince}</span>
    </motion.div>
  );
};

export default ProfileHero;
