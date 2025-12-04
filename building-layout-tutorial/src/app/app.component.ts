// T055-T056: App Component
import { Component } from '@angular/core';
import { BuildingLayoutComponent } from './components/building-layout/building-layout.component';
import { LayoutConfiguration } from './models/layout-config.interface';
import { Region } from './models/region.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BuildingLayoutComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Building Layout Visualization';

  // Sample configuration
  layoutConfig: LayoutConfiguration = {
    name: 'Office Building - Floor 1',
    description: 'Interactive building layout demo with D3.js and Angular',
    regions: [
      {
        id: 'reception',
        x: 0,
        y: 0,
        width: 400,
        height: 200,
        label: 'Reception',
        color: '#E8F5E9',
        strokeColor: '#4CAF50'
      },
      {
        id: 'conf-room-1',
        x: 0,
        y: 200,
        width: 300,
        height: 250,
        label: 'Conference Room 1',
        color: '#E3F2FD',
        strokeColor: '#2196F3'
      },
      {
        id: 'office-1',
        x: 300,
        y: 200,
        width: 200,
        height: 150,
        label: 'Office 101',
        color: '#FFF3E0',
        strokeColor: '#FF9800'
      },
      {
        id: 'office-2',
        x: 300,
        y: 350,
        width: 200,
        height: 100,
        label: 'Office 102',
        color: '#FFF3E0',
        strokeColor: '#FF9800'
      },
      {
        id: 'hallway',
        x: 0,
        y: 450,
        width: 500,
        height: 100,
        label: 'Main Hallway',
        color: '#F5F5F5',
        strokeColor: '#9E9E9E'
      }
    ],
    metadata: {
      buildingName: 'Tech Office Building',
      floorNumber: 1,
      units: 'feet'
    }
  };

  onRegionHover(region: Region | null): void {
    if (region) {
      console.log('Hovered:', region.label);
    }
  }

  onRegionClick(region: Region): void {
    console.log('Clicked:', region.label, region);
    alert(`Clicked: ${region.label}\nPosition: (${region.x}, ${region.y})\nSize: ${region.width} x ${region.height}`);
  }

  onRenderComplete(): void {
    console.log('Visualization rendered successfully!');
  }
}
