import Link from 'next/link';
import { Button } from '@/components/ui';
import { gentlePathEditorialStrings as copy } from '@/strings';

export function EditorialNav({ active }: { active: 'guides' | 'resources' }) {
  return (
    <nav aria-label={copy.editorialNav} className="flex flex-wrap gap-2">
      <Button asChild variant={active === 'guides' ? 'secondary' : 'ghost'}>
        <Link
          href="/admin/guides"
          aria-current={active === 'guides' ? 'page' : undefined}
        >
          {copy.guidesNav}
        </Link>
      </Button>
      <Button asChild variant={active === 'resources' ? 'secondary' : 'ghost'}>
        <Link
          href="/admin/resources"
          aria-current={active === 'resources' ? 'page' : undefined}
        >
          {copy.resourcesNav}
        </Link>
      </Button>
    </nav>
  );
}
