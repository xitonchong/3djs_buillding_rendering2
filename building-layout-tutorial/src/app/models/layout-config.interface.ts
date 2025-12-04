// T007: LayoutConfiguration interface
import { Region } from './region.interface';

export interface LayoutConfiguration {
  // Content
  regions: Region[];

  // Optional Metadata
  name?: string;
  description?: string;
  metadata?: {
    buildingName?: string;
    floorNumber?: number;
    units?: string;
    createdAt?: string;
    modifiedAt?: string;
    [key: string]: any;
  };
}
