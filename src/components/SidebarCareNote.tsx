import Image from 'next/image';
import { gentlePathPortalStrings as copy } from '@/strings';

export function SidebarCareNote() {
  return (
    <aside className="gp-sidebar-care">
      <Image
        src="/gentlepath/path-landscape-v2.png"
        alt={copy.common.decorativeAlt}
        aria-hidden="true"
        width={384}
        height={256}
        className="gp-sidebar-care-art"
      />
      <div>
        <p className="gp-sidebar-care-title">{copy.navigation.sidebarTitle}</p>
        <p className="gp-sidebar-care-description">
          {copy.navigation.sidebarDescription}
        </p>
      </div>
    </aside>
  );
}
