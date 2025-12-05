import { TestBed } from '@angular/core/testing';

import { LayoutLoaderService } from './layout-loader.service';

describe('LayoutLoaderService', () => {
  let service: LayoutLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
