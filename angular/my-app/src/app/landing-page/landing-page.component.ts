import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  selectedGender: string | null = null;
  genders = [
    {value: 'Male', name: "Male"},
    {value: 'Female', name: "Female"}
  ];
  genderValid = true;

  selectedCountry: string | null = null;
  countryValid = true;

  selectedCondition: string = '';
  conditionValid = false;

  age = null;
  ageValid = true;

  medicalSummary = "";

  requesting_tsr = false;

  user_email = null;

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.getUserEmail();
  }

  validateForm() {
    // validation logic here
  }

  request_tsr() {
    // request logic here
  }

  getUserEmail() {
    // get user email logic here
  }

  // Add the searchEnabled method
  searchEnabled(): boolean {
    return this.selectedCondition !== null && this.selectedCountry !== null;
  }
}