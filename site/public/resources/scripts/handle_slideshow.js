"use strict";

addEventListener('load', loadSlideController);

var slides;
var cur_slide = 0;

async function loadSlideController() {
  slides = document.getElementsByClassName("slide");

  let rightslide =   document.getElementById('rightslide');
  let leftslide =   document.getElementById('leftslide');
  rightslide.addEventListener("click", function(event) { event.preventDefault(); updateSlides(1); });
  leftslide.addEventListener("click", function(event) { event.preventDefault(); updateSlides(-1); });

  updateSlides(0);
};

function updateSlides(diff) {
  cur_slide = (cur_slide + diff + slides.length) % slides.length;
  for (let i = 0; i < slides.length; i++) {
    if (i != cur_slide) slides[i].style.display = "none";
    else slides[i].style.display = "block";
  };
};
