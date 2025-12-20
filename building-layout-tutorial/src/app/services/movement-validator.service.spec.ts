import { TestBed } from '@angular/core/testing';
import { MovementValidatorService } from './movement-validator.service';
import { MovementLimit } from '../models/movement-limit.interface';
import { MovementData } from '../models/movement-data.interface';

describe('MovementValidatorService', () => {
  let service: MovementValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MovementValidatorService]
    });
    service = TestBed.inject(MovementValidatorService);
  });

  describe('isLimitExceeded', () => {
    const limits: MovementLimit[] = [
      { fromRegion: 'E-1', toRegion: 'F-2', limit: 30 },
      { fromRegion: 'E-2', toRegion: 'mailroom', limit: 40 }
    ];

    // T009: Test returns true when movement count exceeds limit
    it('should return true when movement count exceeds limit', () => {
      const movement: MovementData = {
        id: 'test-1',
        fromRegion: 'E-1',
        toRegion: 'F-2',
        moves: 35, // Exceeds limit of 30
        workweek: '202501',
        timestamp: new Date()
      };

      const result = service.isLimitExceeded(movement, limits);
      expect(result).toBe(true);
    });

    // T010: Test returns false when movement count is at or below limit
    it('should return false when movement count is at or below limit', () => {
      const movementAtLimit: MovementData = {
        id: 'test-2',
        fromRegion: 'E-1',
        toRegion: 'F-2',
        moves: 30, // Equal to limit
        workweek: '202501',
        timestamp: new Date()
      };

      const movementBelowLimit: MovementData = {
        id: 'test-3',
        fromRegion: 'E-2',
        toRegion: 'mailroom',
        moves: 25, // Below limit of 40
        workweek: '202501',
        timestamp: new Date()
      };

      expect(service.isLimitExceeded(movementAtLimit, limits)).toBe(false);
      expect(service.isLimitExceeded(movementBelowLimit, limits)).toBe(false);
    });

    // T011: Test returns false when no limit is configured for region pair
    it('should return false when no limit is configured for region pair', () => {
      const movement: MovementData = {
        id: 'test-4',
        fromRegion: 'office-1',
        toRegion: 'cafeteria',
        moves: 100, // High count but no limit configured
        workweek: '202501',
        timestamp: new Date()
      };

      const result = service.isLimitExceeded(movement, limits);
      expect(result).toBe(false);
    });
  });

  describe('validateLimits', () => {
    // T012: Test filters out entries with negative or zero limit values
    it('should filter out entries with negative or zero limit values', () => {
      spyOn(console, 'warn');

      const rawLimits: any[] = [
        { fromRegion: 'E-1', toRegion: 'F-2', limit: 30 },  // Valid
        { fromRegion: 'E-2', toRegion: 'mailroom', limit: -10 },  // Invalid: negative
        { fromRegion: 'office-1', toRegion: 'E-1', limit: 0 },  // Invalid: zero
        { fromRegion: 'F-1', toRegion: 'F-2', limit: 25 }  // Valid
      ];

      const validated = service.validateLimits(rawLimits);

      expect(validated.length).toBe(2);
      expect(validated).toEqual([
        { fromRegion: 'E-1', toRegion: 'F-2', limit: 30 },
        { fromRegion: 'F-1', toRegion: 'F-2', limit: 25 }
      ]);
      expect(console.warn).toHaveBeenCalledTimes(2);
    });

    // T013: Test handles duplicate region pairs (uses last value)
    it('should handle duplicate region pairs and use last value', () => {
      spyOn(console, 'warn');

      const rawLimits: any[] = [
        { fromRegion: 'E-1', toRegion: 'F-2', limit: 30 },
        { fromRegion: 'E-1', toRegion: 'F-2', limit: 50 }  // Duplicate
      ];

      const validated = service.validateLimits(rawLimits);

      expect(validated.length).toBe(2); // Both kept but second will override
      expect(validated[1].limit).toBe(50);
      expect(console.warn).toHaveBeenCalledWith(
        'Duplicate limit for region pair (using latest):',
        'E-1:F-2'
      );
    });

    // T022: Test skips entries with missing fromRegion field
    it('should skip entries with missing fromRegion field and log warning', () => {
      spyOn(console, 'warn');

      const rawLimits: any[] = [
        { toRegion: 'F-2', limit: 30 },  // Missing fromRegion
        { fromRegion: 'E-2', toRegion: 'mailroom', limit: 40 }  // Valid
      ];

      const validated = service.validateLimits(rawLimits);

      expect(validated.length).toBe(1);
      expect(validated[0].fromRegion).toBe('E-2');
      expect(console.warn).toHaveBeenCalled();
    });

    // T023: Test skips entries with missing toRegion field
    it('should skip entries with missing toRegion field and log warning', () => {
      spyOn(console, 'warn');

      const rawLimits: any[] = [
        { fromRegion: 'E-1', limit: 30 },  // Missing toRegion
        { fromRegion: 'E-2', toRegion: 'mailroom', limit: 40 }  // Valid
      ];

      const validated = service.validateLimits(rawLimits);

      expect(validated.length).toBe(1);
      expect(validated[0].toRegion).toBe('mailroom');
      expect(console.warn).toHaveBeenCalled();
    });

    // T024: Test skips entries with missing limit field
    it('should skip entries with missing limit field and log warning', () => {
      spyOn(console, 'warn');

      const rawLimits: any[] = [
        { fromRegion: 'E-1', toRegion: 'F-2' },  // Missing limit
        { fromRegion: 'E-2', toRegion: 'mailroom', limit: 40 }  // Valid
      ];

      const validated = service.validateLimits(rawLimits);

      expect(validated.length).toBe(1);
      expect(validated[0].limit).toBe(40);
      expect(console.warn).toHaveBeenCalled();
    });

    // T025: Test handles non-numeric limit values
    it('should handle non-numeric limit values and log warning', () => {
      spyOn(console, 'warn');

      const rawLimits: any[] = [
        { fromRegion: 'E-1', toRegion: 'F-2', limit: 'thirty' },  // Non-numeric
        { fromRegion: 'E-2', toRegion: 'mailroom', limit: 40 }  // Valid
      ];

      const validated = service.validateLimits(rawLimits);

      expect(validated.length).toBe(1);
      expect(validated[0].limit).toBe(40);
      expect(console.warn).toHaveBeenCalled();
    });

    // T026: Test trims whitespace from fromRegion and toRegion
    it('should trim whitespace from fromRegion and toRegion values', () => {
      const rawLimits: any[] = [
        { fromRegion: '  E-1  ', toRegion: '  F-2  ', limit: 30 }
      ];

      const validated = service.validateLimits(rawLimits);

      expect(validated.length).toBe(1);
      expect(validated[0].fromRegion).toBe('E-1');
      expect(validated[0].toRegion).toBe('F-2');
    });
  });
});
