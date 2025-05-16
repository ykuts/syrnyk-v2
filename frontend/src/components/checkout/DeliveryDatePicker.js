// src/components/checkout/DeliveryDatePicker.js
import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Calendar, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './DeliveryDatePicker.css';

/**
 * DeliveryDatePicker component for selecting delivery dates
 * 
 * @param {Object} props - Component props
 * @param {Array} props.dates - Available delivery dates
 * @param {string} props.selectedDate - Currently selected date
 * @param {Function} props.onSelectDate - Handler for date selection
 */
const DeliveryDatePicker = ({ dates, selectedDate, onSelectDate }) => {
  const { t, i18n } = useTranslation(['checkout', 'common']);
  
  // Skip rendering if no dates available
  if (!dates || dates.length === 0) {
    return (
      <div className="text-center text-muted py-3">
        {t('checkout.no_delivery_dates')}
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // Use Intl API for localized date formatting
    return new Intl.DateTimeFormat(i18n.language, {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Group dates by week for better display
  const groupedDates = dates.reduce((acc, date) => {
    const dateObj = new Date(date.date);
    const weekNumber = Math.floor(dateObj.getDate() / 7);
    
    if (!acc[weekNumber]) {
      acc[weekNumber] = [];
    }
    
    acc[weekNumber].push(date);
    return acc;
  }, {});

  return (
    <div className="delivery-date-picker mb-4">
      <div className="mb-3 d-flex align-items-center">
        <Calendar size={20} className="me-2" />
        <h6 className="mb-0">{t('checkout.select_delivery_date')}</h6>
      </div>
      
      {Object.values(groupedDates).map((weekDates, weekIndex) => (
        <Row key={`week-${weekIndex}`} className="mb-3 g-2">
          {weekDates.map(date => (
            <Col 
              key={date.date} 
              xs={12} 
              sm={6} 
              md={4} 
              lg={3}
            >
              <Card 
                className={`date-card ${selectedDate === date.date ? 'selected' : ''}`}
                onClick={() => onSelectDate(date.date)}
              >
                <Card.Body className="p-3">
                  <div className="date-weekday">{date.dayName}</div>
                  <div className="date-full">{formatDate(date.date)}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ))}
      
      {/* When a date is selected, show a confirmation message */}
      {selectedDate && (
        <div className="selected-date-info">
          <Clock size={18} className="me-2" />
          {t('checkout.delivery_scheduled', { date: formatDate(selectedDate) })}
        </div>
      )}
    </div>
  );
};

export default DeliveryDatePicker;
