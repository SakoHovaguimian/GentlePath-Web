import Image from 'next/image';
import { gentlePathGoalStrings as copy } from '@/strings';
import '../styles/goals.css';

export function GoalCoverFallback() {
  return (
    <div className="gp-goal-cover-fallback">
      <Image
        src="/gentlepath/app-icon.png"
        width={160}
        height={160}
        alt={copy.defaultCoverAlt}
      />
    </div>
  );
}
