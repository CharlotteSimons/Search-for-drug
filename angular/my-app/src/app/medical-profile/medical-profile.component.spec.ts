import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalProfileComponent } from './medical-profile.component';

describe('MedicalProfileComponent', () => {
  let component: MedicalProfileComponent;
  let fixture: ComponentFixture<MedicalProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MedicalProfileComponent]
    });
    fixture = TestBed.createComponent(MedicalProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
