import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkweekSelectorComponent } from './workweek-selector.component';

describe('WorkweekSelectorComponent', () => {
  let component: WorkweekSelectorComponent;
  let fixture: ComponentFixture<WorkweekSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkweekSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkweekSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
