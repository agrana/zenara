import { Button } from "@/components/ui/button";

interface AppButtonProps {
  emoji: string;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

export default function AppButton({ emoji, label, onClick, isActive = false }: AppButtonProps) {
  return (
    <Button
      variant={isActive ? "secondary" : "outline"}
      size="icon"
      onClick={onClick}
      title={label} // Native HTML tooltip
      className={`
        w-12 h-12 rounded-full text-xl shadow-md 
        hover:shadow-lg transition-all duration-300
        ${isActive ? "bg-primary/20 hover:bg-primary/30" : "bg-white/50 hover:bg-white/70 dark:bg-slate-800/50 dark:hover:bg-slate-800/70"}
      `}
    >
      {emoji}
    </Button>
  );
}