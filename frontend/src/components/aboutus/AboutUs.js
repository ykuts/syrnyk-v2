// AboutUs.js
import React from 'react';
import { Carousel, Container } from 'react-bootstrap';
import ProductBenefitsSlide from './slides/ProductBenefitsSlide';
import MissionGoalsSlide from './slides/MissionGoalsSlide';
import CollaborationSlide from './slides/CollaborationSlide';
import OurStorySlide from './slides/OurStorySlide';
import './AboutUs.css';

const AboutUs = () => {
  // Navigation arrow components
  const CustomPrevArrow = ({ onClick }) => (
    <button onClick={onClick} className="carousel-nav-btn prev">
      &#8249;
    </button>
  );

  const CustomNextArrow = ({ onClick }) => (
    <button onClick={onClick} className="carousel-nav-btn next">
      &#8250;
    </button>
  );

  // Slide components array for easier maintenance
  const slides = [
    { Component: ProductBenefitsSlide },
    { Component: MissionGoalsSlide },
    { Component: CollaborationSlide },
    { Component: OurStorySlide }
  ];

  return (
    <Container className="my-5">
      <Carousel 
        interval={null} 
        className="about-carousel bg-light rounded shadow"
        prevIcon={<CustomPrevArrow />}
        nextIcon={<CustomNextArrow />}
      >
        {slides.map(({ Component }, index) => (
          <Carousel.Item key={index}>
            <Component />
          </Carousel.Item>
        ))}
      </Carousel>
    </Container>
  );
};

export default AboutUs;