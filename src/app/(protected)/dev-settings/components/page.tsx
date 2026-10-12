import { ComponentLibraryScreen } from '@/modules/component-library/ComponentLibraryScreen';
import { strings } from '@/strings';
export const metadata = { title: strings.componentLibrary.title };
export default function ComponentLibraryPage() {
  return <ComponentLibraryScreen />;
}
