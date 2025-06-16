// src/components/checkout/ImprovedDeliveryScheduler.js
import React, { useState, useEffect } from 'react';
import { Alert, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { formatRelative, format, parseISO } from 'date-fns';
import { enUS, fr, uk } from 'date-fns/locale';
import './ImprovedDeliveryScheduler.css';

/**
 * ImprovedDeliveryScheduler - A component for selecting delivery dates with specific constraints
 * 
 * Features:
 * - Railway station delivery: Mondays only, no time slot
 * - Address delivery in Geneva: Mondays only, no time slot
 * - Address delivery in Vaud: Saturdays only, no time slot
 * - Pickup: Maintains existing behavior (still uses time slots)
 * 
 * @param {Object} props - Component props
 * @param {string} props.deliveryType - The delivery type (ADDRESS, RAILWAY_STATION, PICKUP)
 * @param {string} props.canton - The canton for address delivery (GE, VD)
 * @param {string} props.selectedDate - Currently selected date in YYYY-MM-DD format
 * @param {Function} props.onDateChange - Callback for date changes
 */
const ImprovedDeliveryScheduler = ({ 
  deliveryType,
  canton = 'VD', // Default to Geneva
  selectedDate,
  onDateChange
}) => {
  const { t, i18n } = useTranslation(['checkout', 'delivery']);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get locale for date-fns based on i18n language
  const getLocale = () => {
    switch (i18n.language) {
      case 'fr': return fr;
      case 'uk': return uk;
      default: return enUS;
    }
  };

  // Generate available dates for the next 4 weeks based on delivery type and canton
  useEffect(() => {
    const generateAvailableDates = () => {
      setLoading(true);
      
      const dates = [];
      const today = new Date();
      const fourWeeksLater = new Date(today);
      fourWeeksLater.setDate(today.getDate() + 14); // 4 weeks ahead
      
      // Start from tomorrow to ensure at least 24h notice
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 1);
      
      // Create date objects for each day in the next 4 weeks
      const currentDate = new Date(startDate);
      
      while (currentDate <= fourWeeksLater) {
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, 6 = Saturday
        
        let isAvailable = false;
        
        // Check availability based on delivery type and canton
        if (deliveryType === 'RAILWAY_STATION') {
          // Railway station: Mondays only
          isAvailable = dayOfWeek === 1; // Monday
        } else if (deliveryType === 'ADDRESS') {
          if (canton === 'VD') {
            // Vaud canton: Saturdays only
            isAvailable = dayOfWeek === 6; // Saturday
          } else {
            // Default (Geneva canton): Mondays only
            isAvailable = dayOfWeek === 1; // Monday
          }
        } else if (deliveryType === 'PICKUP') {
          // Pickup: Saturday, Sunday, Monday, Tuesday
          isAvailable = [0, 1, 2, 6].includes(dayOfWeek);
        }
        
        if (isAvailable) {
          dates.push({
            date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
            dayOfWeek: dayOfWeek,
            fullDate: new Date(currentDate) // Store a full date object for formatting
          });
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setAvailableDates(dates);
      setLoading(false);
      
      // Auto-select first date if none is selected and dates are available
      if (!selectedDate && dates.length > 0) {
        onDateChange({ 
          target: { 
            name: 'deliveryDate', 
            value: dates[0].date 
          } 
        });
      }
    };
    
    generateAvailableDates();
  }, [deliveryType, canton, onDateChange, selectedDate]);

  // Format date for display
  const formatDateOption = (date) => {
    try {
      const currentLocale = getLocale();
      
      // Format parts of the date
      const day = format(date, 'd', { locale: currentLocale });
      const month = format(date, 'MM', { locale: currentLocale });
      const weekday = format(date, 'EEEE', { locale: currentLocale });
      
      return { day, month, weekday };
    } catch (err) {
      console.error('Error formatting date:', err);
      return { day: '?', month: '?', weekday: '?' };
    }
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

  // Get delivery day description
   const getDeliveryDayDescription = () => {
    if (deliveryType === 'RAILWAY_STATION') {
      return t('railway_station_days', { ns: 'delivery', defaultValue: 'Railway station delivery is available on Mondays' });
    } else if (deliveryType === 'ADDRESS') {
      return canton === 'VD' 
        ? t('address_vd_days', { ns: 'delivery', defaultValue: 'Delivery in Vaud is available on Saturdays' })
        : t('address_ge_days', { ns: 'delivery', defaultValue: 'Delivery in Geneva is available on Mondays' });
    } else if (deliveryType === 'PICKUP') {
      return t('pickup.available_days', { ns: 'checkout', defaultValue: 'Pickup is available on Saturday, Sunday, Monday, and Tuesday' });
    }
    return '';
  };

  if (loading) {
    return (
      <div className="text-center py-3">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">{t('general.loading', { ns: 'common' })}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  if (availableDates.length === 0) {
    return (
      <Alert variant="warning">
        {t('no_dates_available', { ns: 'delivery', defaultValue: 'No delivery dates available' })}
      </Alert>
    );
  }

  return (
    <div className="delivery-scheduler">
      {/* <div className="delivery-method-note">
        {getDeliveryDayDescription()}
      </div> */}
      
      <div className="dates-container">
        {availableDates.map((dateOption) => {
          const { day, month, weekday } = formatDateOption(dateOption.fullDate);
          const isSelected = selectedDate === dateOption.date;
          
          return (
            <div
              key={dateOption.date}
              className={`date-option ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDateSelect(dateOption.date)}
              role="button"
              aria-pressed={isSelected}
            >
              <span className="date-weekday">{weekday}</span>
              <span className="date-day">{day}.{month}</span>
              {/* <span className="date-month">{month}</span> */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImprovedDeliveryScheduler;