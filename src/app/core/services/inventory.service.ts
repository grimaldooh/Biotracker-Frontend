import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryMedicine, InventoryItem} from '../../modules/inventory/inventory.component';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  constructor(private http: HttpClient) {}

  // Medicinas
  getMedicines(): Observable<InventoryMedicine[]> {
    return this.http.get<InventoryMedicine[]>('http://localhost:8080/api/inventory-medicines');
  }
  addMedicine(medicine: InventoryMedicine): Observable<any> {
    return this.http.post('http://localhost:8080/api/inventory-medicines', medicine);
  }
  updateMedicineQuantity(id: string, medicine: InventoryMedicine): Observable<any> {
    return this.http.put(`http://localhost:8080/api/inventory-medicines/${id}`, medicine);
  }

  // Items
  getItems(): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>('http://localhost:8080/api/inventory-items');
  }
  addItem(item: InventoryItem): Observable<any> {
    return this.http.post('http://localhost:8080/api/inventory-items', item);
  }
  updateItemQuantity(id: string, item: InventoryItem): Observable<any> {
    return this.http.put(`http://localhost:8080/api/inventory-items/${id}`, item);
  }
}