import Image from "next/image";
import Link from "next/link";

type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
  size?: LogoSize;
  href?: string;
  className?: string;
}

const sizeConfig: Record<LogoSize, string> = {
  sm: "h-5",   // Footer (20px)
  md: "h-6",   // Sidebar (24px)
  lg: "h-7",   // Auth header (28px)
  xl: "h-8",   // Navbar (32px)
};

export default function Logo({
  size = "md",
  href = "/",
  className = "",
}: LogoProps) {
  const imageClass = sizeConfig[size];

  const logoContent = (
    <Image
      src="/images/logo.png"
      alt="TomParo"
      width={500}
      height={200}
      className={`${imageClass} w-auto brightness-0 invert`}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} className={`flex items-center ${className}`}>
        {logoContent}
      </Link>
    );
  }

  return <div className={`flex items-center ${className}`}>{logoContent}</div>;
}
