import { TestBed } from '@angular/core/testing';

import { MovementGeneratorService } from './movement-generator.service';

describe('MovementGeneratorService', () => {
  let service: MovementGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovementGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
