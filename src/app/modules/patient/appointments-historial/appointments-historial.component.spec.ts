import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentsHistorialComponent } from './appointments-historial.component';

describe('AppointmentsHistorialComponent', () => {
  let component: AppointmentsHistorialComponent;
  let fixture: ComponentFixture<AppointmentsHistorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentsHistorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppointmentsHistorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
