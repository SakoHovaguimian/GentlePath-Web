import Image from 'next/image';
import Link from 'next/link';
import { Button, UiIcon } from '@/components/ui';
import { gentlePathLandingStrings as copy } from '@/strings';

export function LandingInvitation() {
  return (
    <section
      className="gp-invitation-wrap gp-container"
      aria-labelledby="gentlepath-invitation-title"
    >
      <div className="gp-invitation">
        <div className="gp-invitation-copy">
          <p className="gp-eyebrow">{copy.invitation.eyebrowLabel}</p>
          <h2 id="gentlepath-invitation-title">{copy.invitation.title}</h2>
          <p>{copy.invitation.description}</p>
          <Button asChild className="gp-button gp-button-large">
            <Link href="/signup" prefetch={false}>
              {copy.invitation.primaryAction}
              <UiIcon name="arrowRight" />
            </Link>
          </Button>
        </div>
        <Image
          src="/gentlepath/growing-together-v2.png"
          width={1280}
          height={1280}
          alt={copy.invitation.artAlt}
          sizes="(max-width: 760px) 65vw, 30vw"
        />
      </div>
    </section>
  );
}
