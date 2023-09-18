import { Component } from '@angular/core';

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent {
  currentImageIndex = 0;
  images = [
    {text: 'myTomorrows collects, deduplicates and updates all interventional clinical trials and Expanded Access Programs from clinicaltrials.gov and clinicaltrialsregister.eu every day'},
    {src: 'assets/images/rules.png', text: 'Lots of registered clinical trials do not add potential clinical benefit to patients; we built a filter to hide clinical trials that adhere to one of these characteristics'},
    {text: 'TrialSearch AI uses the power of large language models with dedicated prompting techniques created by healthcare professionals with years of experience discovering investigational treatments', buttonText: 'Learn more about TrialSearch AI'},
    {src: 'assets/videos/drugdata.mov', text: 'Evidence-based decision making by searching the web real-time and summarize the results with large language models'},
    {src: 'assets/images/recruitment-status.png', text: 'Recruitment statuses can be outdated; help us creating the most up to date database of investigational treatment options by providing feedback when a clinical trial site status is not up to date'},
    {src: 'assets/images/enrollment.png', text: 'Request enrollment and if the trial site is registered on our platform, direct contact between patient, treating physician and clinical trial site representative is available. All in one secure environment!'}
  ];

  nextImage() {
    if (this.currentImageIndex < this.images.length - 1) {
      this.currentImageIndex++;
    }
  }

  previousImage() {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }
}