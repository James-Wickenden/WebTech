"use strict";

addEventListener('load', loadSlideController);

var slides;
var cur_slide = 0;

// This script clicks through images uploaded with content.
// Special cases for 0 images: no images are shown.
// 1 image: no scrolling arrows are shown at the sides.

async function loadSlideController() {
  let rightslide = document.getElementById('rightslide');
  let leftslide  = document.getElementById('leftslide');

  slides = document.getElementsByClassName("slide");
  if (slides.length == 0) {
    document.getElementById('slideshow').style.display = "none";
  }
  else if (slides.length == 1) {
    rightslide.style.display = "none";
    leftslide.style.display = "none";
  }
  else {
    rightslide.addEventListener("click", function(event) { event.preventDefault(); updateSlides(1); });
    leftslide.addEventListener("click", function(event) { event.preventDefault(); updateSlides(-1); });

    updateSlides(0);
  };
};

function updateSlides(diff) {
  cur_slide = (cur_slide + diff + slides.length) % slides.length;
  for (let i = 0; i < slides.length; i++) {
    if (i != cur_slide) slides[i].style.display = "none";
    else slides[i].style.display = "block";
  };
};
