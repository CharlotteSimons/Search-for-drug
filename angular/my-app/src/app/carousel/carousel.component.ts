import { Component } from '@angular/core';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent {
  currentImageIndex = 0;
  images = ['assets/images/tree.jpg', 'assets/images/treeroots.jpg']; // Add more image paths as needed

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }
}