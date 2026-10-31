'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { createQueryClient } from '@/lib/client/queryClient';
import { ContactForm } from '@/modules/contact/components/ContactForm';
import { createPublicContactService } from '@/publicClientContainer';
import { PresentationProvider } from '@/presentation/PresentationProvider';
import { gentlePathContactStrings as copy } from '@/strings';
import '../styles/landing-contact.css';

export function LandingContact() {
  const [client] = useState(createQueryClient);
  const [service] = useState(createPublicContactService);

  return (
    <section
      id="contact"
      className="gp-contact gp-container"
      aria-labelledby="gentlepath-contact-title"
    >
      <div className="gp-contact-heading">
        <h2 id="gentlepath-contact-title">{copy.title}</h2>
        <p className="gp-contact-description">{copy.description}</p>
      </div>
      <QueryClientProvider client={client}>
        <PresentationProvider>
          <ContactForm service={service} />
        </PresentationProvider>
      </QueryClientProvider>
    </section>
  );
}
