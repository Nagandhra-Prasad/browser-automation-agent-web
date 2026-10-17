import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ResultTableRow } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ResultsService {
  private readonly http = inject(HttpClient);

  table(): Observable<ResultTableRow[]> {
    return this.http.get<ResultTableRow[]>(`${environment.apiUrl}/results/table`);
  }
}
