
export interface VideoFile {
  id: string;
  name: string;
  size: string;
  url: string;
  type: string;
  lastModified: number;
  folderName: string;
  relativePath: string;
}

export enum AspectRatio {
  FIT = 'Fit',
  STRETCH = 'Stretch',
  CROP = 'Crop',
  SIXTEEN_NINE = '16:9',
  FOUR_THREE = '4:3'
}

export interface PlayerSettings {
  playbackSpeed: number;
  aspectRatio: AspectRatio;
  isLocked: boolean;
}
