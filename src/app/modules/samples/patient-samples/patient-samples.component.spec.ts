import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSamplesComponent } from './patient-samples.component';

describe('PatientSamplesComponent', () => {
  let component: PatientSamplesComponent;
  let fixture: ComponentFixture<PatientSamplesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientSamplesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientSamplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
