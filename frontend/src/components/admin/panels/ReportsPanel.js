// frontend/src/components/admin/panels/ReportsPanel.js
import React, { useState, useEffect } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import ReportsFilters from './ReportsPanelComponents/ReportsFilters';
import ReportsSummary from './ReportsPanelComponents/ReportsSummary';
import PivotTableContainer from './ReportsPanelComponents/PivotTableContainer';
import { apiClient } from '../../../utils/api';
import './ReportsPanelComponents/PivotTable.css';

const ReportsPanel = () => {
  const [reportData, setReportData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    deliveryType: 'all'
  });

  // Load initial data
  useEffect(() => {
    fetchReportData();
    fetchSummaryData();
  }, [filters]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.deliveryType !== 'all') params.append('deliveryType', filters.deliveryType);
      
      const response = await apiClient.get(`/reports/orders-data?${params.toString()}`);
      
      if (response.success) {
        setReportData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch report data');
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err.message || 'Failed to load report data');
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryData = async () => {
    try {
      // Calculate period based on date range
      const period = filters.startDate && filters.endDate
        ? Math.ceil((new Date(filters.endDate) - new Date(filters.startDate)) / (1000 * 60 * 60 * 24))
        : 30;
      
      const response = await apiClient.get(`/reports/orders-summary?period=${period}`);
      
      if (response.success) {
        setSummaryData(response.summary);
      }
    } catch (err) {
      console.error('Error fetching summary data:', err);
      // Don't show error for summary - it's not critical
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleRefresh = () => {
    fetchReportData();
    fetchSummaryData();
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Звіти та аналітика</h2>
      </div>

      {/* Filters Section */}
      <ReportsFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading>Помилка завантаження даних</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2">Завантаження даних...</div>
        </div>
      )}

      {/* Summary Cards */}
      {summaryData && !loading && (
        <ReportsSummary 
          summaryData={summaryData}
          filters={filters}
        />
      )}

      {/* Pivot Table */}
      {!loading && !error && reportData.length > 0 && (
        <PivotTableContainer 
          data={reportData}
          filters={filters}
        />
      )}

      {/* No Data Message */}
      {!loading && !error && reportData.length === 0 && (
        <Alert variant="info" className="text-center py-5">
          <h5>Немає даних для відображення</h5>
          <p>Спробуйте змінити фільтри або перевірте, чи є замовлення в системі.</p>
        </Alert>
      )}
    </Container>
  );
};

export default ReportsPanel;