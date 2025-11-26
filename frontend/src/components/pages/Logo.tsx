import { Code } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizes[size]} bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center`}>
        <Code className="w-3/5 h-3/5 text-white" />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
          CodePlay<span className="text-accent">+</span>
        </span>
      )}
    </div>
  );
}
