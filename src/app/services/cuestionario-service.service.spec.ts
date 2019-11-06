import { TestBed } from '@angular/core/testing';

import { CuestionarioServiceService } from './cuestionario-service.service';

describe('CuestionarioServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CuestionarioServiceService = TestBed.get(CuestionarioServiceService);
    expect(service).toBeTruthy();
  });
});
