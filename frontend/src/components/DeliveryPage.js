import { Container, Row, Col  } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import "./DeliveryPayment.css";
import "./DeliveryContent.css";
import './MeetingCard.css';


const DeliveryPage = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/railway-stations');
        if (!response.ok) {
          throw new Error('Failed to fetch stations');
        }
        const data = await response.json();
        console.log('Received stations data:', data); // Отладочный вывод
        setStations(data.data);
        setError(null);
      } catch (err) {
        setError('Помилка при завантаженні даних про станції');
        console.error('Error fetching stations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  return (
    <Container>
      <div className="delivery-payment">
        <h1 className="page-title">ДОСТАВКА ТА ОПЛАТА</h1>
        <Container>
      <div className="content-sections-container">
        <Row xs={1} md={2} className="g-5">
          <Col>
            <ContentSection
              title="Оплата за продукцію"
              content="Ми пропонуємо кілька зручних способів оплати для вашого комфорту. Оплата при отриманні замовлення: Ви можете сплатити готівкою нашому кур'єру під час отримання вашого замовлення. Оплата на рахунок нашої асоціації: Ви можете здійснити оплату через TWINT або за реквізитами асоціації при отриманні замовлення, реквізити вам надішлуть у повідомленні з підтвердженням вашого замовлення. Прозора ціна на продукцію, сплачуєте сума після отримання замовлення. Обирайте найбільш зручний для вас спосіб оплати, ми забезпечимо швидку та надійну доставку вашого замовлення."
            />
          </Col>
          <Col>
            <ContentSection
              title="Доставка на залізничні вокзали"
              content="Ми пропонуємо безкоштовну доставку на основні залізничні вокзали кантону Во та Женева (VULLY, GENEVE). Мінімальне замовлення для безкоштовної доставки — 20 франків. Дні та час доставки щоденно з 10:00 до 19:00 (залежить графік на кожну станцію нижче)"
            />
          </Col>
          <Col>
            <ContentSection
              title="Доставка за адресою"
              content="Ми пропонуємо нашу послугу доставки продукції додому або в офіс. Мінімальне замовлення для адресної доставки: 100 франків. Доставки здійснюються щоденно, за винятком вихідних. Ви отримаєте підтвердження щодо доставки з нашим оператором."
            />
          </Col>
          <Col>
            <ContentSection
              title="Порядок прийому замовлень"
              content="Після оформлення замовлення ви отримуєте повідомлення, що ми прийняли його в обробку. Після перевірки ми надішлемо вам статус вашого замовлення, що воно готове до отримання. Зв'яжемося з вами перед вказаним часом доставки."
            />
          </Col>
        </Row>
      </div>
    </Container>
        
        <div className="meeting-cards">
          {loading ? (
            <div className="loading">Завантаження станцій...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : stations.length === 0 ? (
            <div className="no-stations">Станції не знайдені</div>
          ) : (
            // Группируем станции по городам
            Object.entries(
              stations.reduce((acc, station) => {
                if (!acc[station.city]) {
                  acc[station.city] = [];
                }
                acc[station.city].push(station);
                return acc;
              }, {})
            ).map(([city, cityStations]) => (
              <div key={city} className="city-group">
                {/* <h3 className="city-title">{city}</h3> */}
                <div className="city-stations">
                  {cityStations.map(station => (
                    <MeetingCard
                      key={station.id}
                      city={station.city}
                      station={station.name}
                      location={station.meetingPoint}
                      imageSrc={station.photo}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Container>
  );
};

// Компонент для отображения раздела с контентом
const ContentSection = ({ title, content }) => (
  <div className="content-section">
    <h2>{title}</h2>
    <p>{content}</p>
  </div>
);

// Обновленный компонент карточки встречи
const MeetingCard = ({ city, station, location, imageSrc }) => {

    const [imageError, setImageError] = useState(false);

    console.log('MeetingCard props:', { city, station, location, imageSrc });

    const getImageUrl = (path) => {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      // Убираем возможное дублирование /uploads/
      const cleanPath = path.replace(/^\/uploads\//, '');
      return `http://localhost:3001/uploads/${cleanPath}`;
  };

  // URL изображения по умолчанию
  const defaultImageUrl = 'http://localhost:3001/uploads/default-station.jpg';

  // Определяем итоговый URL изображения
  const finalImageUrl = imageError ? defaultImageUrl : getImageUrl(imageSrc);
  
  console.log('MeetingCard props:', { city, station, location, imageSrc });
  console.log('Final image URL:', finalImageUrl);
    
    return (
      <div className="meeting-card">
      <div className="meeting-info">
          <div className="city">{`Місто: ${city}`}</div>
          <div className="station">{`Дата/час: ${station}`}</div>
          <div className="location">{`Місце зустрічі:`}</div>
          <div className="location">{`${location}`}</div>
      </div>
      <div className="meeting-image">
          <img 
              src={finalImageUrl || defaultImageUrl}
              alt={`Meeting location at ${station}`} 
              onError={(e) => {
                  console.log('Failed to load image:', e.target.src);
                  if (!imageError) {
                      setImageError(true);
                  }
              }}
          />
      </div>
  </div>
      );
    };


export default DeliveryPage;