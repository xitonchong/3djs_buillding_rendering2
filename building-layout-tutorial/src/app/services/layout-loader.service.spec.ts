import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LayoutLoaderService } from './layout-loader.service';

describe('LayoutLoaderService', () => {
  let service: LayoutLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(LayoutLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
