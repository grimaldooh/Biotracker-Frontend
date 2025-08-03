import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessAppointmentComponent } from './process-appointment.component';

describe('ProcessAppointmentComponent', () => {
  let component: ProcessAppointmentComponent;
  let fixture: ComponentFixture<ProcessAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessAppointmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
