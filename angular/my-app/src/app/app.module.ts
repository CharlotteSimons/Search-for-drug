import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { SearchAutocompleteComponent } from './search-autocomplete/search-autocomplete.component';
import { CountryAutocompleteComponent } from './country-autocomplete/country-autocomplete.component';
import { EducationComponent } from './education/education.component';
import { MedicalProfileComponent } from './medical-profile/medical-profile.component';
import { AgeInputComponent } from './age-input/age-input.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    SearchAutocompleteComponent,
    CountryAutocompleteComponent,
    EducationComponent,
    MedicalProfileComponent,
    AgeInputComponent
  ],
  exports: [
    SearchAutocompleteComponent,
    CountryAutocompleteComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    FormsModule,
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
