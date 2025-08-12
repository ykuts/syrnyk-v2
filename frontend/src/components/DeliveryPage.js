import { Container, Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../utils/api';
import { getImageUrl } from '../config';
import ReactMarkdown from 'react-markdown';
import "./DeliveryPayment.css";
import "./DeliveryContent.css";
import './MeetingCard.css';

const DeliveryPage = () => {
  const { t, i18n } = useTranslation(['delivery', 'common']);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const currentLanguage = i18n.language;
        const data = await apiClient.get(`/railway-stations?lang=${currentLanguage}`);
        setStations(data.data);
      } catch (err) {
        setError(t('errors.load_stations', { ns: 'delivery' }));
        console.error('Error fetching stations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [t, i18n.language]);

  // Delivery schedule data
  const deliverySchedule = [
    {
      city: 'Nyon',
      dayTime: t('schedule.nyon.day_time', { ns: 'delivery' }),
      meetingPoint: t('schedule.nyon.meeting_point', { ns: 'delivery' })
    },
    {
      city: 'Aigle',
      dayTime: t('schedule.aigle.day_time', { ns: 'delivery' }),
      meetingPoint: t('schedule.aigle.meeting_point', { ns: 'delivery' })
    },
    {
      city: 'Rolle',
      dayTime: t('schedule.rolle.day_time', { ns: 'delivery' }),
      meetingPoint: t('schedule.rolle.meeting_point', { ns: 'delivery' })
    },
    {
      city: 'Vevey',
      dayTime: t('schedule.vevey.day_time', { ns: 'delivery' }),
      meetingPoint: t('schedule.vevey.meeting_point', { ns: 'delivery' })
    },
    {
      city: 'Montreux',
      dayTime: t('schedule.montreux.day_time', { ns: 'delivery' }),
      meetingPoint: t('schedule.montreux.meeting_point', { ns: 'delivery' })
    },
    {
      city: 'Lausanne',
      dayTime: t('schedule.lausanne.day_time', { ns: 'delivery' }),
      meetingPoint: t('schedule.lausanne.meeting_point', { ns: 'delivery' })
    },
    {
      city: 'Morges',
      dayTime: t('schedule.morges.day_time', { ns: 'delivery' }),
      meetingPoint: t('schedule.morges.meeting_point', { ns: 'delivery' })
    },
    {
      city: 'Geneve',
      dayTime: t('schedule.geneve.day_time', { ns: 'delivery' }),
      meetingPoint: t('schedule.geneve.meeting_point', { ns: 'delivery' })
    }
  ];

  return (
    <Container>
      <div className="delivery-payment">
        <h1 className="page-title">{t('title', { ns: 'delivery' })}</h1>
        <Container style={{ padding: "5px" }}>
          <div className="content-sections-container">
            {/* Force large gap with CSS variables */}
            <Row xs={1} md={2} className="gx-5 gy-4">
              {/* Payment Section */}
              <Col className="h-100 d-flex">
               
                <ContentSection 
                  title={t('payment.title', { ns: 'delivery' })}
                  content={
                    <>
                      <p>{t('payment.intro', { ns: 'delivery' })}</p>
                      <ol>
                        <li>
                          {t('payment.cash.title', { ns: 'delivery' })}:
                          <ReactMarkdown>{t('payment.cash.description', { ns: 'delivery' })}</ReactMarkdown>
                        </li>
                        <li>
                          {t('payment.transfer.title', { ns: 'delivery' })}:
                          <ReactMarkdown>{t('payment.transfer.description', { ns: 'delivery' })}</ReactMarkdown>
                        </li>
                      </ol>
                      <p>{t('payment.prepayment', { ns: 'delivery' })}</p>
                      <p>{t('payment.conclusion', { ns: 'delivery' })}</p>
                    </>
                  }
                />
              
              </Col>

              {/* Station Delivery Section */}
              <Col >
              
                <ContentSection
                  title={t('station_delivery.title', { ns: 'delivery' })}
                  content={
                    <>
                      <p>
                        <ReactMarkdown>{t('station_delivery.intro', { ns: 'delivery' })}</ReactMarkdown>
                      </p>
                      <p>
                        <strong>{t('station_delivery.min_order.label', { ns: 'delivery' })}</strong>:
                        {t('station_delivery.min_order.value', { ns: 'delivery' })}
                      </p>
                      <p>
                        <strong>{t('station_delivery.schedule.label', { ns: 'delivery' })}</strong>:
                        {t('station_delivery.schedule.value', { ns: 'delivery' })}
                      </p>
                    </>
                  }
                />
                
              </Col>

              {/* Address Delivery Section */}
              <Col >
                
                  <ContentSection
                  title={t('address_delivery.title', { ns: 'delivery' })}
                  content={
                    <>
                      <p>
                        <strong>{t('address_delivery.free.title', { ns: 'delivery' })}</strong>
                        {t('address_delivery.free.description', { ns: 'delivery' })}
                      </p>
                      <p>
                        <strong>{t('address_delivery.schedule.label', { ns: 'delivery' })}</strong>:
                        {t('address_delivery.schedule.value', { ns: 'delivery' })}
                      </p>
                      {/* Commented section preserved */}
                      {/* <p>
                        <ReactMarkdown>{t('address_delivery.paid.intro', { ns: 'delivery' })}</ReactMarkdown> 
                        <ReactMarkdown>{t('address_delivery.paid.min_order.value', { ns: 'delivery' })}</ReactMarkdown>
                        <ReactMarkdown>{t('address_delivery.paid.cost.description', { ns: 'delivery' })}</ReactMarkdown>
                      </p> */}
                    </>
                  }
                />
                
              </Col>

              {/* Order Process Section */}
              <Col className="h-100 d-flex">
                
                  <ContentSection
                  title={t('order_process.title', { ns: 'delivery' })}
                  content={
                    <ol>
                      <li>{t('order_process.step1', { ns: 'delivery' })}</li>
                      <li>{t('order_process.step2', { ns: 'delivery' })}</li>
                      <li>{t('order_process.step3', { ns: 'delivery' })}</li>
                      <li>{t('order_process.step4', { ns: 'delivery' })}</li>
                    </ol>
                  }
                />
                
              </Col>
            </Row>
          </div>
        </Container>

        {/* Meeting Cards Section */}
        <div className="meeting-cards">
          {loading ? (
            <div className="loading">{t('stations.loading', { ns: 'delivery' })}</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : stations.length === 0 ? (
            <div className="no-stations">{t('stations.not_found', { ns: 'delivery' })}</div>
          ) : (
            // Group stations by city
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

// Component for displaying content sections
const ContentSection = ({ title, content }) => (
  <div className="content-section-delivery">
    <h2>{title}</h2>
    <div>{content}</div>
  </div>
);

// Updated meeting card component
const MeetingCard = ({ city, station, location, imageSrc }) => {
  const { t } = useTranslation('delivery');
  const [imageError, setImageError] = useState(false);

  // Get URLs with explicit 'station' type
  const defaultImageUrl = getImageUrl(null, 'station');
  const imageUrl = imageError ? defaultImageUrl : getImageUrl(imageSrc, 'station');

  return (
    <div className="meeting-card">
      <div className="meeting-info">
        <div className="city">{`${t('stations.city')}: ${city}`}</div>
        <div className="day-time">{`${t('stations.day_time')}: ${station}`}</div>
        <div className="location"><strong>{`${t('stations.meeting_point')}:`}</strong></div>
        <div className="location">{`${location}`}</div>
      </div>
      <div className="meeting-image">
        <img
          src={imageUrl}
          alt={`${t('stations.alt_text')} ${station}`}
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