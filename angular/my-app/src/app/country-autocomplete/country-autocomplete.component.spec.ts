import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountryAutocompleteComponent } from './country-autocomplete.component';

describe('CountryAutocompleteComponent', () => {
  let component: CountryAutocompleteComponent;
  let fixture: ComponentFixture<CountryAutocompleteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CountryAutocompleteComponent]
    });
    fixture = TestBed.createComponent(CountryAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
