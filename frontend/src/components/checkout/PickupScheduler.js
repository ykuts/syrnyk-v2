// src/components/checkout/PickupScheduler.js
import { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import './DeliveryDatePicker.css';

/**
 * Component for scheduling pickup at the store
 * Allows selecting dates organized in pickup cycles (Sat, Sun, Mon, Tue)
 * Available only on Saturday, Sunday, Monday, and Tuesday
 */
const PickupScheduler = ({ 
  selectedDate, 
  selectedTimeSlot, 
  onDateChange, 
  onTimeSlotChange 
}) => {
  const { t, i18n } = useTranslation('checkout');
  const [availableDates, setAvailableDates] = useState({ firstCycle: [], secondCycle: [] });
  const [error, setError] = useState(null);
  
  // Available time slots for pickup
  const PICKUP_TIME_SLOTS = [
    { id: '09:00-13:00', name: t('pickup.morning'), startTime: '09:00', endTime: '13:00' },
    { id: '13:00-17:00', name: t('pickup.afternoon'), startTime: '13:00', endTime: '17:00' },
    { id: '17:00-20:00', name: t('pickup.evening'), startTime: '17:00', endTime: '20:00' }
  ];

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

  // Generate available dates organized by pickup cycles
  useEffect(() => {
    const generateAvailableDates = () => {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 21); // 3 weeks ahead to ensure we get 2 complete cycles
      
      // Start from tomorrow to ensure at least 24h notice
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 1);
      
      const allAvailableDates = [];
      const currentDate = new Date(startDate);
      
      // Collect all available dates first
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Only include Saturday (6), Sunday (0), Monday (1), Tuesday (2)
        if ([1, 6].includes(dayOfWeek)) {
          allAvailableDates.push({
            date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
            dayOfWeek: dayOfWeek,
            dayName: getDayName(dayOfWeek, i18n.language),
            fullDate: new Date(currentDate)
          });
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Group dates into pickup cycles (Sat, Sun, Mon, Tue)
      const cycles = [];
      let currentCycle = [];
      
      for (let i = 0; i < allAvailableDates.length; i++) {
        const currentDateObj = allAvailableDates[i];
        const dayOfWeek = currentDateObj.dayOfWeek;
        
        // If we encounter a Saturday and already have dates in current cycle, start new cycle
        if (dayOfWeek === 6 && currentCycle.length > 0) {
          cycles.push([...currentCycle]);
          currentCycle = [];
        }
        
        currentCycle.push(currentDateObj);
        
        // If current cycle has all 4 days (Sat, Sun, Mon, Tue) or it's the last date
        if (currentCycle.length === 4 || i === allAvailableDates.length - 1) {
          if (currentCycle.length > 0) {
            cycles.push([...currentCycle]);
            currentCycle = [];
          }
        }
      }
      
      // Return first two cycles
      return {
        firstCycle: cycles[0] || [],
        secondCycle: cycles[1] || []
      };
    };
    
    const { firstCycle, secondCycle } = generateAvailableDates();
    setAvailableDates({ firstCycle, secondCycle });
    
    // Auto-select first date if none is selected
    const allDates = [...firstCycle, ...secondCycle];
    if (!selectedDate && allDates.length > 0) {
      onDateChange({ 
        target: { 
          name: 'deliveryDate', 
          value: allDates[0].date 
        } 
      });
      
      // Auto-select first time slot if none is selected
      if (!selectedTimeSlot) {
        onTimeSlotChange({ 
          target: { 
            name: 'deliveryTimeSlot', 
            value: PICKUP_TIME_SLOTS[0].id 
          } 
        });
      }
    }
  }, [i18n.language, onDateChange, onTimeSlotChange, selectedDate, selectedTimeSlot]);

  // Format date for display as DD.MM
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
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

  // Check if we have any available dates
  const hasAvailableDates = availableDates.firstCycle.length > 0 || availableDates.secondCycle.length > 0;

  if (!hasAvailableDates) {
    return (
      <Alert variant="warning">
        {t('pickup.no_dates_available')}
      </Alert>
    );
  }

  // Render a column of dates
  const renderDateColumn = (dates, title) => (
    <div className="col-6">
      
      <div className="dates-container flex-column">
        {dates.map((dateOption) => {
          const { day, month } = formatDate(dateOption.date);
          const isSelected = selectedDate === dateOption.date;
          
          return (
            <div
              key={dateOption.date}
              className={`date-option ${isSelected ? 'selected' : ''} mb-2`}
              onClick={() => handleDateSelect(dateOption.date)}
              style={{ minWidth: '100%' }}
            >
              <div className="d-flex justify-content-between align-items-center" style={{ gap: '10px' }}>
                <span className="date-weekday">{dateOption.dayName}</span> 
                <span className="date-weekday">{day}.{month}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="pickup-scheduler mb-4">
      <h5 className="mb-3">{t('pickup.schedule_title')}</h5>
      
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      {/* Date selection - organized by pickup cycles in two columns */}
      <div className="date-picker-container">
        <div className="date-picker-header">{t('pickup.select_date')}</div>
        
        <div className="row">
          {/* First Pickup Cycle */}
          {availableDates.firstCycle.length > 0 && 
            renderDateColumn(
              availableDates.firstCycle, 
              /* t('pickup.first_cycle', { defaultValue: 'This Week' }) */
            )
          }
          
          {/* Second Pickup Cycle */}
          {availableDates.secondCycle.length > 0 && 
            renderDateColumn(
              availableDates.secondCycle, 
              /* t('pickup.second_cycle', { defaultValue: 'Next Week' }) */
            )
          }
        </div>
      </div>
      
      {/* Time slots selection */}
      <div className="date-picker-container">
        <div className="date-picker-header">{t('pickup.select_time')}</div>
        
        <div className="time-slots-container">
          {PICKUP_TIME_SLOTS.map((slot) => {
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
      </div>
      
      {/* <div className="mt-3 text-muted small">
        {t('pickup.note')}
      </div> */}
    </div>
  );
};

export default PickupScheduler;