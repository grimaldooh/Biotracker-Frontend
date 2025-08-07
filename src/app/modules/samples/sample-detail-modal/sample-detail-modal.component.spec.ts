import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleDetailModalComponent } from './sample-detail-modal.component';

describe('SampleDetailModalComponent', () => {
  let component: SampleDetailModalComponent;
  let fixture: ComponentFixture<SampleDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SampleDetailModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SampleDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
