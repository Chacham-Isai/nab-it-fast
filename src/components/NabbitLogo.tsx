import { Link } from "react-router-dom";
import nabbitLogo from "@/assets/nabbit-logo.png";

interface NabbitLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { img: "h-7", text: "text-base" },
  md: { img: "h-8", text: "text-lg" },
  lg: { img: "h-9 sm:h-10", text: "text-lg sm:text-xl" },
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
