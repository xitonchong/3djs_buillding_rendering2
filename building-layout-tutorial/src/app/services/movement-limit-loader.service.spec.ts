import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MovementLimitLoaderService } from './movement-limit-loader.service';
import { MovementLimit } from '../models/movement-limit.interface';

describe('MovementLimitLoaderService', () => {
  let service: MovementLimitLoaderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MovementLimitLoaderService]
    });
    service = TestBed.inject(MovementLimitLoaderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // T005: Test successfully loads valid movement-limits.json file
  it('should successfully load valid movement-limits.json file', (done) => {
    const mockLimits: MovementLimit[] = [
      { fromRegion: 'E-1', toRegion: 'F-2', limit: 30 },
      { fromRegion: 'E-2', toRegion: 'mailroom', limit: 40 }
    ];

    service.loadLimits().subscribe({
      next: (limits) => {
        expect(limits).toEqual(mockLimits);
        expect(limits.length).toBe(2);
        done();
      },
      error: () => fail('Should not have errored')
    });

    const req = httpMock.expectOne('assets/data/movement-limits.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockLimits);
  });

  // T006: Test returns empty array for missing file (404 error)
  it('should return empty array for missing file (404 error)', (done) => {
    spyOn(console, 'warn');

    service.loadLimits().subscribe({
      next: (limits) => {
        expect(limits).toEqual([]);
        expect(limits.length).toBe(0);
        expect(console.warn).toHaveBeenCalledWith(
          'Movement limits file not found, using no limits'
        );
        done();
      },
      error: () => fail('Should not have errored')
    });

    const req = httpMock.expectOne('assets/data/movement-limits.json');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  // T007: Test returns empty array for malformed JSON with error logged
  it('should return empty array for malformed JSON with error logged', (done) => {
    spyOn(console, 'error');

    service.loadLimits().subscribe({
      next: (limits) => {
        expect(limits).toEqual([]);
        expect(limits.length).toBe(0);
        expect(console.error).toHaveBeenCalledWith(
          'Failed to parse movement limits:',
          jasmine.any(Object)
        );
        done();
      },
      error: () => fail('Should not have errored')
    });

    const req = httpMock.expectOne('assets/data/movement-limits.json');
    // Trigger a parsing error by flushing with an error event
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
  });

  // T027: Test handles HTTP 404 error gracefully with console warning
  it('should handle HTTP 404 error gracefully with console warning', (done) => {
    spyOn(console, 'warn');

    service.loadLimits().subscribe({
      next: (limits) => {
        expect(limits).toEqual([]);
        expect(console.warn).toHaveBeenCalledWith(
          'Movement limits file not found, using no limits'
        );
        done();
      },
      error: () => fail('Should not have errored')
    });

    const req = httpMock.expectOne('assets/data/movement-limits.json');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });
});
