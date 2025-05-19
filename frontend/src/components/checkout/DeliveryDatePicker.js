// src/components/DeliveryDatePicker.js
import React, { useState, useEffect } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { apiClient } from '../utils/api';
import { formatRelative, format, parseISO } from 'date-fns';
import { enUS, fr, uk } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import './DeliveryDatePicker.css';
/**

Component for selecting delivery dates based on delivery method
*/
const DeliveryDatePicker = ({
  deliveryMethod,
  postalCode,
  canton,
  selectedDate,
  selectedTimeSlot,
  onDateChange,
  onTimeSlotChange,
  zoneId
}) => {
  const { t, i18n } = useTranslation('checkout');
  const [availableDates, setAvailableDates] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
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
  // Fetch available delivery dates
  useEffect(() => {
    const fetchAvailableDates = async () => {
      if (!deliveryMethod) return;
      setLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('deliveryMethod', deliveryMethod);

        if (zoneId) params.append('zoneId', zoneId);
        if (canton) params.append('canton', canton);

        const response = await apiClient.get(`/delivery/available-dates?${params.toString()}`);

        if (response && response.availableDates) {
          setAvailableDates(response.availableDates);

          // Auto-select first date if none is selected
          if (!selectedDate && response.availableDates.length > 0) {
            const firstDate = response.availableDates[0].date;
            onDateChange({ target: { name: 'deliveryDate', value: firstDate } });
          }
        } else {
          setAvailableDates([]);
        }
      } catch (err) {
        console.error('Error fetching available dates:', err);
        setError(t('delivery.errors.dates_fetch_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableDates();
  }, [deliveryMethod, zoneId, canton, onDateChange, selectedDate, t]);
  // Fetch time slots when date is selected
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate || !deliveryMethod) return;
      try {
        // Convert selectedDate (ISO string like "2023-05-15") to day of week (0-6)
        const date = parseISO(selectedDate);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Build query parameters
        const params = new URLSearchParams();
        if (zoneId) params.append('zoneId', zoneId);
        params.append('dayOfWeek', dayOfWeek.toString());

        const response = await apiClient.get(`/delivery/time-slots?${params.toString()}`);

        if (response && Array.isArray(response)) {
          setTimeSlots(response);

          // Auto-select first time slot if none is selected
          if (!selectedTimeSlot && response.length > 0) {
            const firstSlotId = `${response[0].startTime}-${response[0].endTime}`;
            onTimeSlotChange({ target: { name: 'deliveryTimeSlot', value: firstSlotId } });
          }
        } else {
          setTimeSlots([]);
        }
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setTimeSlots([]);
      }
    };

    fetchTimeSlots();
  }, [selectedDate, deliveryMethod, zoneId, onTimeSlotChange, selectedTimeSlot]);
  // Format date for display
  const formatDateOption = (dateString) => {
    try {
      const date = parseISO(dateString);
      const currentLocale = getLocale();
      // Format parts of the date
      const day = format(date, 'd');
      const month = format(date, 'MMM', { locale: currentLocale });
      const weekday = format(date, 'EEE', { locale: currentLocale });

      return { day, month, weekday };
    } catch (err) {
      console.error('Error formatting date:', err);
      return { day: '?', month: '?', weekday: '?' };
    }
  };
  // Handle date selection
  const handleDateSelect = (dateString) => {
    onDateChange({ target: { name: 'deliveryDate', value: dateString } });
  };
  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot) => {
    const timeSlotId = timeSlot.startTime - timeSlot.endTime;
    //  const timeSlotId = ${timeSlot.startTime}-${timeSlot.endTime};
    onTimeSlotChange({ target: { name: 'deliveryTimeSlot', value: timeSlotId } });
  };
  // If no delivery method is selected, don't show the picker
  if (!deliveryMethod) {
    return null;
  }
  // Show loading state
  if (loading) {
    return (
      <div className="date-picker-container">
        <div className="loading-dates">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>{t('delivery.loading_dates')}</span>
        </div>
      </div>
    );
  }
  // Show error state
  if (error) {
    return (
      <div className="date-picker-container">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }
  // If no dates available
  if (availableDates.length === 0) {
    return (
      <div className="date-picker-container">
        <div className="no-dates">
          {t('delivery.no_dates_available')}
        </div>
      </div>
    );
  }
  return (
    <div className="date-picker-container">
      <div className="date-picker-header">
        {t('delivery.select_date')}
      </div>
      {/* Date options */}
      <div className="dates-container">
        {availableDates.map((dateOption) => {
          const { day, month, weekday } = formatDateOption(dateOption.date);
          const isSelected = selectedDate === dateOption.date;

          return (
            <div
              key={dateOption.date}
              className={`date-option ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDateSelect(dateOption.date)}
            >
              <span className="date-weekday">{weekday}</span>
              <span className="date-day">{day}</span>
              <span className="date-month">{month}</span>
            </div>
          );
        })}
      </div>

      {/* Time slots */}
      {selectedDate && timeSlots.length > 0 && (
        <div>
          <div className="date-picker-header">
            {t('delivery.select_time')}
          </div>
          <div className="time-slots-container">
            {timeSlots.map((slot) => {
              const timeSlotId = `${slot.startTime}-${slot.endTime}`;
              const isSelected = selectedTimeSlot === timeSlotId;

              return (
                <div
                  key={timeSlotId}
                  className={`time-slot ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleTimeSlotSelect(slot)}
                >
                  {slot.startTime} - {slot.endTime}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No time slots available message */}
      {selectedDate && timeSlots.length === 0 && (
        <div className="no-dates mt-3">
          {t('delivery.no_time_slots')}
        </div>
      )}
    </div>
  );
};
export default DeliveryDatePicker;