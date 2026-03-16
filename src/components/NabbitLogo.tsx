import { Link } from "react-router-dom";
import nabbitLogo from "@/assets/nabbit-logo.png";

interface NabbitLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { img: "h-5", text: "text-sm" },
  md: { img: "h-6", text: "text-base" },
  lg: { img: "h-7 sm:h-8", text: "text-base sm:text-lg" },
};

const NabbitLogo = ({ size = "md", className = "" }: NabbitLogoProps) => {
  const s = sizeMap[size];
  return (
    <Link to="/" className={`flex items-center gap-2 shrink-0 ${className}`}>
      <img src={nabbitLogo} alt="nabbit.ai" className={s.img} />
      <span className={`${s.text} font-bold text-foreground tracking-tight`}>
        nabbit<span className="text-primary">.ai</span>
      </span>
    </Link>
  );
};

export default NabbitLogo;
