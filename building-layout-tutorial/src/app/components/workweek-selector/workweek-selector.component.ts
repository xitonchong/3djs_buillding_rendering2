/**
 * Workweek Selector Component
 *
 * Provides a checkbox list interface for selecting multiple non-consecutive workweeks
 * to filter movement data visualization.
 */

import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormattedWeekLabel } from '../../models/workweek-selector.interface';

@Component({
  selector: 'app-workweek-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workweek-selector.component.html',
  styleUrl: './workweek-selector.component.scss'
})
export class WorkweekSelectorComponent implements OnChanges {
  /**
   * Array of available workweek strings in YYYYWW format
   */
  @Input() availableWeeks: string[] = [];

  /**
   * Array of currently selected workweek strings
   */
  @Input() selectedWeeks: string[] = [];

  /**
   * Whether the selector is disabled
   */
  @Input() disabled: boolean = false;

  /**
   * Event emitted when workweek selection changes
   */
  @Output() selectionChange = new EventEmitter<string[]>();

  /**
   * Formatted week labels for display
   */
  formattedWeeks: FormattedWeekLabel[] = [];

  /**
   * Internal selection state (for checkbox binding)
   */
  weekSelectionState: Map<string, boolean> = new Map();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['availableWeeks'] || changes['selectedWeeks']) {
      this.updateFormattedWeeks();
      this.updateSelectionState();
    }
  }

  /**
   * Format available weeks for display
   */
  private updateFormattedWeeks(): void {
    this.formattedWeeks = this.availableWeeks.map(week => this.formatWeekLabel(week));
  }

  /**
   * Update internal selection state from selectedWeeks input
   */
  private updateSelectionState(): void {
    this.weekSelectionState.clear();
    this.availableWeeks.forEach(week => {
      this.weekSelectionState.set(week, this.selectedWeeks.includes(week));
    });
  }

  /**
   * Convert workweek string (YYYYWW) to human-readable format
   *
   * @param workweek - Workweek in YYYYWW format (e.g., "202525")
   * @returns Formatted week label object
   */
  formatWeekLabel(workweek: string): FormattedWeekLabel {
    if (!workweek || workweek.length !== 6) {
      return {
        workweek,
        label: workweek,
        weekNumber: 0,
        year: 0
      };
    }

    const year = parseInt(workweek.substring(0, 4), 10);
    const weekNumber = parseInt(workweek.substring(4, 6), 10);

    return {
      workweek,
      label: `Week ${weekNumber}, ${year}`,
      weekNumber,
      year
    };
  }

  /**
   * Handle checkbox change event
   *
   * @param workweek - The workweek that was toggled
   * @param event - The checkbox change event
   */
  onCheckboxChange(workweek: string, event: Event): void {
    if (this.disabled) {
      return;
    }

    const checkbox = event.target as HTMLInputElement;
    const isChecked = checkbox.checked;

    // Update internal state
    this.weekSelectionState.set(workweek, isChecked);

    // Build new selection array
    const newSelection: string[] = [];
    this.availableWeeks.forEach(week => {
      if (this.weekSelectionState.get(week)) {
        newSelection.push(week);
      }
    });

    // Emit change event
    this.selectionChange.emit(newSelection);
  }

  /**
   * Check if a specific week is selected
   *
   * @param workweek - Workweek to check
   * @returns True if selected, false otherwise
   */
  isWeekSelected(workweek: string): boolean {
    return this.weekSelectionState.get(workweek) || false;
  }

  /**
   * Get the display label for a workweek
   *
   * @param workweek - Workweek string
   * @returns Formatted label
   */
  getWeekLabel(workweek: string): string {
    const formatted = this.formattedWeeks.find(w => w.workweek === workweek);
    return formatted ? formatted.label : workweek;
  }
}
