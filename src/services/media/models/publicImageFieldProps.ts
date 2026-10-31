export interface PublicImageFieldProps {
  id: string;
  value: string;
  label: string;
  disabled: boolean;
  error?: string;
  onChange: (url: string) => void;
  onUploadStateChange: (busy: boolean) => void;
}
