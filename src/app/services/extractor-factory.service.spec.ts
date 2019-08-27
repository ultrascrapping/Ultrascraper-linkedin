import { TestBed } from '@angular/core/testing';

import { ExtractorFactoryService } from './extractor-factory.service';

describe('ExtractorFactoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ExtractorFactoryService = TestBed.get(ExtractorFactoryService);
    expect(service).toBeTruthy();
  });
});
