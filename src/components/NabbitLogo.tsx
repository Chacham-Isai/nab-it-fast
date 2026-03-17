import { Link } from "react-router-dom";
import nabbitIcon from "@/assets/nabbit-icon.png";

interface NabbitLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { img: "h-5 w-5", text: "text-base", glow: "w-8 h-8 blur-[12px]" },
  md: { img: "h-6 w-6", text: "text-lg", glow: "w-10 h-10 blur-[16px]" },
  lg: { img: "h-7 w-7 sm:h-8 sm:w-8", text: "text-lg sm:text-xl", glow: "w-12 h-12 blur-[20px]" },
};

const NabbitLogo = ({ size = "md", className = "" }: NabbitLogoProps) => {
  const s = sizeMap[size];
  return (
    <Link to="/" className={`flex items-center gap-2 shrink-0 group ${className}`}>
      <div className="relative">
        <div className={`absolute inset-0 m-auto ${s.glow} rounded-full bg-[hsl(var(--nab-cyan)/0.3)] opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        <img
          src={nabbitIcon}
          alt="nabbit.ai icon"
          className={`${s.img} relative drop-shadow-[0_0_8px_hsl(var(--nab-cyan)/0.4)] group-hover:drop-shadow-[0_0_14px_hsl(var(--nab-cyan)/0.6)] transition-all duration-300`}
        />
      </div>
      <span className={`${s.text} font-heading font-black tracking-tight`}>
        <span className="text-foreground">nabbit</span>
        <span className="gradient-text">.ai</span>
      </span>
    </Link>
  );
};

export default NabbitLogo;
