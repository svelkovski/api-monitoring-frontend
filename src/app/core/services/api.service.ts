import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PageResponse } from '../model/page-response.model';
import { Observable } from 'rxjs';
import { Api } from '../model/api.model';
import { CreateApiRequest } from '../model/create-api-request.model';
import { ApiResponse } from '../model/api-response.model';
import { Check } from '../model/check.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = `${environment.apiUrl}/api`;

  private httpClient = inject(HttpClient);

  create(data: CreateApiRequest): Observable<ApiResponse> {
    return this.httpClient.post<ApiResponse>(`${this.apiUrl}/create`, data);
  }

  getAll(page: number = 0, size: number = 10): Observable<PageResponse<Api>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.httpClient.get<PageResponse<Api>>(this.apiUrl, { params });
  }

  update(id: number, data: CreateApiRequest): Observable<ApiResponse> {
    return this.httpClient.put<ApiResponse>(
      `${this.apiUrl}/${id}/update`,
      data,
    );
  }

  delete(id: number): Observable<ApiResponse> {
    return this.httpClient.delete<ApiResponse>(`${this.apiUrl}/${id}/delete`);
  }

  getChecks(
    id: number,
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<Check>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.httpClient.get<PageResponse<Check>>(
      `${this.apiUrl}/${id}/checks`,
      { params },
    );
  }

  getById(id: number): Observable<Api> {
    return this.httpClient.get<Api>(`${this.apiUrl}/${id}`);
  }
}
