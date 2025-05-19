// src/components/checkout/RailwayStationScheduler.js
import React, { useState, useEffect } from 'react';
import { Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import './DeliveryDatePicker.css';

/**
 * Component for scheduling railway station delivery
 * Allows selecting dates (for the next 2 weeks) and time slots
 * Available only on Mondays
 */
const RailwayStationScheduler = ({ 
  selectedDate, 
  selectedTimeSlot, 
  onDateChange, 
  onTimeSlotChange 
}) => {
  const { t, i18n } = useTranslation('checkout');
  const [availableDates, setAvailableDates] = useState([]);
  const [error, setError] = useState(null);
  
  // Available time slots for railway station delivery
  const RAILWAY_TIME_SLOTS = [
    { id: '10:00-13:00', name: t('railway.morning'), startTime: '10:00', endTime: '13:00' },
    { id: '16:00-19:00', name: t('railway.evening'), startTime: '16:00', endTime: '19:00' }
  ];

  // Generate available dates for the next 2 weeks - Mondays only
  useEffect(() => {
    const generateAvailableDates = () => {
      const dates = [];
      const today = new Date();
      const twoWeeksLater = new Date(today);
      twoWeeksLater.setDate(today.getDate() + 14);
      
      // Start from tomorrow to ensure at least 24h notice
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 1);
      
      // Create date objects for each day in the next 2 weeks
      const currentDate = new Date(startDate);
      
      while (currentDate <= twoWeeksLater) {
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Only include Mondays (1)
        if (dayOfWeek === 1) {
          dates.push({
            date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
            dayOfWeek: dayOfWeek,
            dayName: getDayName(dayOfWeek, i18n.language)
          });
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return dates;
    };
    
    const availableDates = generateAvailableDates();
    setAvailableDates(availableDates);
    
    // Auto-select first date if none is selected
    if (!selectedDate && availableDates.length > 0) {
      onDateChange({ 
        target: { 
          name: 'deliveryDate', 
          value: availableDates[0].date 
        } 
      });
      
      // Auto-select first time slot if none is selected
      if (!selectedTimeSlot) {
        onTimeSlotChange({ 
          target: { 
            name: 'deliveryTimeSlot', 
            value: RAILWAY_TIME_SLOTS[0].id 
          } 
        });
      }
    }
  }, [i18n.language, onDateChange, onTimeSlotChange, selectedDate, selectedTimeSlot]);

  // Get day name based on language
  const getDayName = (dayOfWeek, language) => {
    const days = {
      en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      uk: ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'Пʼятниця', 'Субота'],
      fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    };
    
    // Default to Ukrainian if language not supported
    const languageDays = days[language] || days.uk;
    return languageDays[dayOfWeek];
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString(i18n.language, { month: 'short' });
    return { day, month };
  };

  // Handle date selection
  const handleDateSelect = (dateString) => {
    onDateChange({ 
      target: { 
        name: 'deliveryDate', 
        value: dateString 
      } 
    });
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlotId) => {
    onTimeSlotChange({ 
      target: { 
        name: 'deliveryTimeSlot', 
        value: timeSlotId 
      } 
    });
  };

  if (availableDates.length === 0) {
    return (
      <Alert variant="warning">
        {t('railway.no_dates_available')}
      </Alert>
    );
  }

  return (
    <div className="railway-scheduler mb-4">
      <h5 className="mb-3">{t('railway.schedule_title')}</h5>
      
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      <Card className="mb-3">
        <Card.Body>
          <h6 className="mb-3">{t('railway.select_date')}</h6>
          
          <div className="dates-container">
            {availableDates.map((dateOption) => {
              const { day, month } = formatDate(dateOption.date);
              const isSelected = selectedDate === dateOption.date;
              
              return (
                <div
                  key={dateOption.date}
                  className={`date-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleDateSelect(dateOption.date)}
                >
                  <span className="date-weekday">{dateOption.dayName}</span>
                  <span className="date-day">{day}</span>
                  <span className="date-month">{month}</span>
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Body>
          <h6 className="mb-3">{t('railway.select_time')}</h6>
          
          <div className="time-slots-container">
            {RAILWAY_TIME_SLOTS.map((slot) => {
              const isSelected = selectedTimeSlot === slot.id;
              
              return (
                <div
                  key={slot.id}
                  className={`time-slot ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleTimeSlotSelect(slot.id)}
                >
                  {slot.name} ({slot.startTime} - {slot.endTime})
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>
      
      <div className="mt-3 text-muted small">
        {t('railway.note')}
      </div>
    </div>
  );
};

export default RailwayStationScheduler;