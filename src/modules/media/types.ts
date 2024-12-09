export interface MediaEditorConfig {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
  onSave?: (buffer: Buffer) => Promise<void>;
  mediaType?: string;
  mediaUrl?: string;
}

export interface MediaEditorProps extends MediaEditorConfig {
  mediaType: string;
  mediaUrl?: string;
  width?: number;
  height?: number;
  onSave?: (buffer: Buffer) => Promise<void>;
} 