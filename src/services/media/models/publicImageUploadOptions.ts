export interface PublicImageUploadOptions {
  disabled: boolean;
  onUploaded: (url: string) => void;
  onUploadStateChange: (busy: boolean) => void;
}
