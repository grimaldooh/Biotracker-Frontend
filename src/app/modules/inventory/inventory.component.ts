import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../../core/services/inventory.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
  }

  ngOnInit() {
    this.loadMedicines();
    this.loadItems();
  }

  loadMedicines() {
    this.inventoryService.getMedicines().subscribe({
      next: (data) => { this.medicines = data; this.loadingMedicines = false; },
      error: () => { this.loadingMedicines = false; }
    });
  }

  loadItems() {
    this.inventoryService.getItems().subscribe({
      next: (data) => { this.items = data; this.loadingItems = false; },
      error: () => { this.loadingItems = false; }
    });
  }

  addMedicine() {
    if (this.medicineForm.invalid) return;
    this.inventoryService.addMedicine(this.medicineForm.value).subscribe(() => {
      this.medicineForm.reset();
      this.loadMedicines();
    });
  }

  addItem() {
    if (this.itemForm.invalid) return;
    this.inventoryService.addItem(this.itemForm.value).subscribe(() => {
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
