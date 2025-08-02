import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleAppointmentsComponent } from './schedule-appointments.component';

describe('ScheduleAppointmentsComponent', () => {
  let component: ScheduleAppointmentsComponent;
  let fixture: ComponentFixture<ScheduleAppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleAppointmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
