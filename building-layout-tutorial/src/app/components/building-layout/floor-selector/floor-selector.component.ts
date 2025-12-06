// T123-T124: FloorSelectorComponent for multi-floor navigation
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FloorInfo } from '../../../models/floor.interface';

@Component({
  selector: 'app-floor-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floor-selector.component.html',
  styleUrl: './floor-selector.component.scss'
})
export class FloorSelectorComponent {
  // T124: Input floors array with floor information
  @Input() floors: FloorInfo[] = [];

  // T124: Currently selected floor
  @Input() selectedFloor: number = 0;

  // T124: Output event when floor selection changes
  @Output() floorChange = new EventEmitter<number>();

  /**
   * Handle floor selection
   * @param floor - Floor number to select
   */
  selectFloor(floor: number): void {
    this.floorChange.emit(floor);
  }
}
