import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md";
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = "md", className = "" }) => {
  // sm = 120px (forms/headers), md = 160px (landing page)
  // Responsive: slightly smaller on mobile
  const sizeClasses = size === "sm" 
    ? "w-24 sm:w-28 md:w-32"  // 96px -> 112px -> 128px
    : "w-32 sm:w-36 md:w-40"; // 128px -> 144px -> 160px

  return (
    <Link
      href="/"
      className={`block shrink-0 transition-all hover:opacity-80 active:scale-95 ${className}`}
    >
      <Image
        src="/logo.png"
        alt="Logo"
        width={0}
        height={0}
        sizes="100vw"
        className={`${sizeClasses} h-auto`}
        priority
      />
    </Link>
  );
};

export default Logo;
