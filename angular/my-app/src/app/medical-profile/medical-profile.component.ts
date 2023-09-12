import { Component, Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'textarea[appAutosize]'
})
export class AutosizeDirective {
  @HostListener('input', ['$event.target'])
  onInput(textArea: HTMLTextAreaElement): void {
    this.adjust(textArea);
  }

  constructor(public element: ElementRef) { }

  ngAfterContentChecked(): void {
    this.adjust();
  }

  adjust(textArea?: HTMLTextAreaElement): void {
    textArea = textArea || this.element.nativeElement;
    if (textArea) {
      textArea.style.overflow = 'hidden';
      textArea.style.height = 'auto';
      textArea.style.height = textArea.scrollHeight + 'px';
    }
  }
}

@Component({
  selector: 'app-medical-profile',
  templateUrl: './medical-profile.component.html',
  styleUrls: ['./medical-profile.component.css']
})
export class MedicalProfileComponent {
  medicalSummary = '';
}