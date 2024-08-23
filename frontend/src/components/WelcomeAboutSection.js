import Carousel from 'react-bootstrap/Carousel';
import { Link } from 'react-router-dom';

function WelcomeAboutSection({data}) {
  return (
    <div>
    <Carousel>
      {data
      .map(about => { 
        return (
          <Carousel.Item key={about.id}>
            <img
              className="d-block w-100"
              src={about.image}
              alt={"Slide" + about.id}
            />
            <Carousel.Caption className='d-flex flex-column justify-content-center align-items-center h-100 '>
              <div className="custom-caption-bg">

              <h3>{about.title}</h3>
              <p>{about.text}</p>
              
              <Link className='btn btn-primary' to={`/about/${about.id}`}>Детальніше...</Link>
              </div>
            </Carousel.Caption>
          </Carousel.Item>
        )
      })}
      
    </Carousel>
    </div>
  );
}

export default WelcomeAboutSection;