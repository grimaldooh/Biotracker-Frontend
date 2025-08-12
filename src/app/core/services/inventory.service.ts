import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryMedicine, InventoryItem } from '../../modules/inventory/inventory.component';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private itemsUrl = 'http://localhost:8080/api/inventory-items';
  private medicinesUrl = 'http://localhost:8080/api/inventory-medicines';

  constructor(private http: HttpClient) {}

  addMedicine(medicine: InventoryMedicine, hospitalId: string): Observable<any> {
    return this.http.post(`${this.medicinesUrl}/hospital/${hospitalId}`, medicine);
  }

  addItem(item: InventoryItem, hospitalId: string): Observable<any> {
    return this.http.post(`${this.itemsUrl}/hospital/${hospitalId}`, item);
  }

  getMedicines(hospitalId: string): Observable<InventoryMedicine[]> {
    return this.http.get<InventoryMedicine[]>(`${this.medicinesUrl}?hospitalId=${hospitalId}`);
  }

  getItems(hospitalId: string): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.itemsUrl}?hospitalId=${hospitalId}`);
  }

  updateMedicineQuantity(id: string, updated: InventoryMedicine): Observable<any> {
    return this.http.put(`${this.medicinesUrl}/${id}`, updated);
  }

  updateItemQuantity(id: string, updated: InventoryItem): Observable<any> {
    return this.http.put(`${this.itemsUrl}/${id}`, updated);
  }
}