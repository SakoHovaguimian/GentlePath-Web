'use client';

import { useEffect, useRef, useState } from 'react';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { gentlePathEditorialStrings as copy } from '@/strings';
import type { EditorialFormErrors } from './models/editorialFormErrors';

export function useEditorialDraft<T>(initial: () => T, busy: boolean) {
  const [form, setForm] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(form));
  const [errors, setErrors] = useState<EditorialFormErrors>({});
  const [failure, setFailure] = useState('');
  const [notice, setNotice] = useState('');
  const dirty = JSON.stringify(form) !== baseline;
  const dirtyRef = useRef(dirty);
  const busyRef = useRef(busy);
  useEffect(() => {
    dirtyRef.current = dirty;
    busyRef.current = busy;
  }, [dirty, busy]);
  const requestLeave = useUnsavedFormGuard(
    dirtyRef,
    busyRef,
    copy.discardDescription,
  );
  const update = (next: T) => {
    dirtyRef.current = JSON.stringify(next) !== baseline;
    setForm(next);
    setNotice('');
  };
  const accept = (next: T) => {
    setForm(next);
    setBaseline(JSON.stringify(next));
    dirtyRef.current = false;
    setErrors({});
    setFailure('');
    setNotice(copy.savedDescription);
  };
  const lock = () => {
    if (busyRef.current) return false;
    busyRef.current = true;
    return true;
  };
  const release = () => {
    busyRef.current = false;
  };
  const allowNavigation = () => {
    dirtyRef.current = false;
    busyRef.current = false;
  };
  const isBusy = () => busyRef.current;
  return {
    form,
    update,
    accept,
    dirty,
    lock,
    release,
    allowNavigation,
    isBusy,
    errors,
    setErrors,
    failure,
    setFailure,
    notice,
    setNotice,
    requestLeave,
  };
}
