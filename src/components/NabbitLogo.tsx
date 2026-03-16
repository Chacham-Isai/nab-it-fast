import { Link } from "react-router-dom";
import nabbitIcon from "@/assets/nabbit-icon.png";

interface NabbitLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { img: "h-5 w-5", text: "text-base" },
  md: { img: "h-6 w-6", text: "text-lg" },
  lg: { img: "h-7 w-7 sm:h-8 sm:w-8", text: "text-lg sm:text-xl" },
};

const NabbitLogo = ({ size = "md", className = "" }: NabbitLogoProps) => {
  const s = sizeMap[size];
  return (
    <Link to="/" className={`flex items-center gap-1.5 shrink-0 ${className}`}>
      <img src={nabbitIcon} alt="nabbit.ai icon" className={s.img} />
      <span className={`${s.text} font-black text-foreground tracking-tight`}>
        nabbit<span className="text-primary">.ai</span>
      </span>
    </Link>
  );
};

export default NabbitLogo;
