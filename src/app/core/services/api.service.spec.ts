import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should call GET /api with correct page params', () => {
    service.getAll(0, 10).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === 'http://localhost:8080/api',
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    req.flush({
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
    });
  });

  it('should call POST /api/create with correct body', () => {
    const payload = {
      name: 'My API',
      url: 'https://example.com',
      method: 'GET',
    };
    service.create(payload).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/create');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1, ...payload, status: 'UNKNOWN' });
  });

  it('should call PUT /api/:id/update with correct body', () => {
    const payload = {
      name: 'Updated',
      url: 'https://updated.com',
      method: 'POST',
    };
    service.update(1, payload).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/1/update');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1, ...payload, status: 'UNKNOWN' });
  });

  it('should call DELETE /api/:id/delete', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/1/delete');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should call GET /api/:id/checks with correct params', () => {
    service.getChecks(1, 0, 20).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === 'http://localhost:8080/api/1/checks',
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('20');
    req.flush({
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 20,
    });
  });
});
