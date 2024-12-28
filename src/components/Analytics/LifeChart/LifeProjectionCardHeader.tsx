import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface LifeProjectionCardHeaderProps {
  name: string;
  color: string;
  percentOfWakingLife: number;
}

export default function LifeProjectionCardHeader({
  name,
  color,
  percentOfWakingLife,
}: LifeProjectionCardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <motion.div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: color }}
          whileHover={{ scale: 1.2 }}
          transition={{ duration: 0.2 }}
        />
        <h3 className="font-medium">{name}</h3>
      </div>
      <Badge variant="secondary" className="transition-all duration-300">
        {percentOfWakingLife.toFixed(1)}% of life
      </Badge>
    </div>
  );
}