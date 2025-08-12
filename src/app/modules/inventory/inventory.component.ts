import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../core/services/inventory.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {
  medicines: InventoryMedicine[] = [];
  items: InventoryItem[] = [];
  loadingMedicines = true;
  loadingItems = true;
  searchMedicine = '';
  searchItem = '';
  medicineForm: FormGroup;
  itemForm: FormGroup;
  medicineOrder: string[] = [];
  itemOrder: string[] = [];
  hospitalId: string = '';

  constructor(private fb: FormBuilder, private inventoryService: InventoryService) {
    this.medicineForm = this.fb.group({
      name: ['', Validators.required],
      brand: ['', Validators.required],
      activeSubstance: ['', Validators.required],
      dosage: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      expirationDate: ['', Validators.required],
      location: ['', Validators.required]
    });
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      category: ['', Validators.required]
    });

    // Obtener hospitalId dinámico de localStorage
    const hospitalInfo = localStorage.getItem('hospitalInfo');
    if (hospitalInfo) {
      try {
        const hospital = JSON.parse(hospitalInfo);
        this.hospitalId = hospital.id || '';
      } catch {
        this.hospitalId = '';
      }
    }
  }

  ngOnInit() {
    this.loadMedicines();
    this.loadItems();
  }

  loadMedicines() {
    if (!this.hospitalId) {
      this.loadingMedicines = false;
      return;
    }
    this.inventoryService.getMedicines(this.hospitalId).subscribe({
      next: (data) => {
        if (this.medicineOrder.length === 0) {
          this.medicineOrder = data.map(m => m.id!);
        }
        // Ordena según el orden original
        this.medicines = this.medicineOrder
          .map(id => data.find(m => m.id === id))
          .filter(Boolean) as InventoryMedicine[];
        this.loadingMedicines = false;
      },
      error: () => { this.loadingMedicines = false; }
    });
  }

  loadItems() {
    if (!this.hospitalId) {
      this.loadingItems = false;
      return;
    }
    this.inventoryService.getItems(this.hospitalId).subscribe({
      next: (data) => {
        if (this.itemOrder.length === 0) {
          this.itemOrder = data.map(i => i.id!);
        }
        this.items = this.itemOrder
          .map(id => data.find(i => i.id === id))
          .filter(Boolean) as InventoryItem[];
        this.loadingItems = false;
      },
      error: () => { this.loadingItems = false; }
    });
  }

  addMedicine() {
    if (this.medicineForm.invalid || !this.hospitalId) return;
    this.inventoryService.addMedicine(this.medicineForm.value, this.hospitalId).subscribe(() => {
      this.medicineForm.reset();
      this.loadMedicines();
    });
  }

  addItem() {
    if (this.itemForm.invalid || !this.hospitalId) return;
    this.inventoryService.addItem(this.itemForm.value, this.hospitalId).subscribe(() => {
      this.itemForm.reset();
      this.loadItems();
    });
  }

  updateMedicineQuantity(id: string, delta: number) {
    const medicine = this.medicines.find(m => m.id === id);
    if (!medicine) return;
    const newQuantity = medicine.quantity + delta;
    if (newQuantity < 0) return;
    const updatedMedicine = { ...medicine, quantity: newQuantity };
    this.inventoryService.updateMedicineQuantity(id, updatedMedicine).subscribe(() => this.loadMedicines());
  }

  updateItemQuantity(id: string, delta: number) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity < 0) return;
    const updatedItem = { ...item, quantity: newQuantity };
    this.inventoryService.updateItemQuantity(id, updatedItem).subscribe(() => this.loadItems());
  }

  get filteredMedicines() {
    const term = this.searchMedicine.toLowerCase();
    return this.medicines.filter(m => m.name.toLowerCase().includes(term) || m.brand.toLowerCase().includes(term));
  }

  get filteredItems() {
    const term = this.searchItem.toLowerCase();
    return this.items.filter(i => i.name.toLowerCase().includes(term) || i.category.toLowerCase().includes(term));
  }

  trackByMedicineId(index: number, medicine: InventoryMedicine) {
    return medicine.id;
  }
  trackByItemId(index: number, item: InventoryItem) {
    return item.id;
  }

  confirmUpdateMedicineQuantity(medicine: InventoryMedicine, delta: number) {
    const newQuantity = medicine.quantity + delta;
    if (newQuantity < 0) return;
    if (confirm(`¿Seguro que deseas ${delta > 0 ? 'aumentar' : 'disminuir'} la cantidad de "${medicine.name}" a ${newQuantity}?`)) {
      const updated = { ...medicine, quantity: newQuantity };
      this.inventoryService.updateMedicineQuantity(medicine.id!, updated).subscribe(() => this.loadMedicines());
    }
  }

  confirmUpdateItemQuantity(item: InventoryItem, delta: number) {
    const newQuantity = item.quantity + delta;
    if (newQuantity < 0) return;
    if (confirm(`¿Seguro que deseas ${delta > 0 ? 'aumentar' : 'disminuir'} la cantidad de "${item.name}" a ${newQuantity}?`)) {
      const updated = { ...item, quantity: newQuantity };
      this.inventoryService.updateItemQuantity(item.id!, updated).subscribe(() => this.loadItems());
    }
  }

  // Métodos para estadísticas
  getTotalMedicines(): number {
    return this.filteredMedicines?.length || 0;
  }

  getTotalItems(): number {
    return this.filteredItems?.length || 0;
  }

  getLowStockCount(): number {
    const lowStockMedicines = this.filteredMedicines?.filter(m => m.quantity < 10).length || 0;
    const lowStockItems = this.filteredItems?.filter(i => i.quantity < 5).length || 0;
    return lowStockMedicines + lowStockItems;
  }

  getExpiringCount(): number {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    return this.filteredMedicines?.filter(medicine => {
      if (!medicine.expirationDate) return false;
      const expDate = new Date(medicine.expirationDate);
      return expDate <= thirtyDaysFromNow;
    }).length || 0;
  }

  // Método para clases de expiración
  getExpirationClass(expirationDate: string): string {
    if (!expirationDate) return 'text-slate-500';
    
    const today = new Date();
    const expDate = new Date(expirationDate);
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    if (expDate < today) {
      return 'text-red-600'; // Expirado
    } else if (expDate <= thirtyDaysFromNow) {
      return 'text-amber-600'; // Por expirar
    } else {
      return 'text-slate-500'; // Normal
    }
  }
}

export interface InventoryMedicine {
  id: string;
  name: string;
  brand: string;
  activeSubstance: string;
  dosage: string;
  quantity: number;
  expirationDate: string;
  location: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  location: string;
  category: string;
}
