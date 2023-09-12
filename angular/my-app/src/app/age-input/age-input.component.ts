import { Component } from '@angular/core';

@Component({
  selector: 'app-age-input',
  templateUrl: './age-input.component.html',
  styleUrls: ['./age-input.component.css']
})
export class AgeInputComponent {
  age: number | null = null;
  ageValid = true;

  validateAge(): void {
    if (this.age == null) {
      this.ageValid = false;
    } else {
      this.ageValid = true;
    }
  }
}
