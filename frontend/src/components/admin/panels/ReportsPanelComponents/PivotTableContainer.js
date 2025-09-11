// frontend/src/components/admin/panels/ReportsPanelComponents/PivotTableContainer.js
import React, { useState } from 'react';
import { Card, Alert, Button, ButtonGroup, Row, Col } from 'react-bootstrap';
import { Download, Settings, BarChart3, Save } from 'lucide-react';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import TableRenderers from 'react-pivottable/TableRenderers';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';

// Create the renderers including Plotly charts
const PlotlyRenderers = createPlotlyRenderers(Plot);

const PivotTableContainer = ({ data, filters }) => {
  // Default pivot configuration for planning reports
  const [pivotState, setPivotState] = useState({
    data: data,
    aggregatorName: 'Sum',
    vals: ['quantity'],
    rows: ['product_name'],
    cols: ['delivery_date'],
    rendererName: 'Table',
    unusedOrientationCutoff: 85
  });

  // Predefined configurations for common reports
  const presetConfigs = {
    production_planning: {
      name: 'Планування виробництва',
      config: {
        aggregatorName: 'Sum',
        vals: ['quantity'],
        rows: ['product_name', 'product_category'],
        cols: ['delivery_date'],
        rendererName: 'Table'
      }
    },
    station_delivery: {
      name: 'Доставка на станції',
      config: {
        aggregatorName: 'Count',
        vals: [],
        rows: ['station_name', 'delivery_date'],
        cols: ['product_name'],
        rendererName: 'Table'
      }
    },
    delivery_by_canton: {
      name: 'Доставка по кантонах',
      config: {
        aggregatorName: 'Count',
        vals: [],
        rows: ['delivery_canton', 'delivery_type'],
        cols: ['delivery_date'],
        rendererName: 'Heatmap'
      }
    },
    customer_analysis: {
      name: 'Аналіз клієнтів',
      config: {
        aggregatorName: 'Sum',
        vals: ['item_total'],
        rows: ['customer_type', 'delivery_type'],
        cols: ['order_month'],
        rendererName: 'Bar Chart'
      }
    },
    revenue_analysis: {
      name: 'Аналіз доходів',
      config: {
        aggregatorName: 'Sum',
        vals: ['item_total'],
        rows: ['product_category'],
        cols: ['order_month', 'delivery_type'],
        rendererName: 'Stacked Bar Chart'
      }
    },
    weekly_planning: {
      name: 'Тижневе планування',
      config: {
        aggregatorName: 'Sum',
        vals: ['quantity'],
        rows: ['product_name'],
        cols: ['delivery_week', 'delivery_type'],
        rendererName: 'Table'
      }
    },
    delivery_efficiency: {
      name: 'Ефективність доставки',
      config: {
        aggregatorName: 'Average',
        vals: ['delivery_cost'],
        rows: ['delivery_type', 'delivery_canton'],
        cols: ['order_month'],
        rendererName: 'Heatmap'
      }
    }
  };

  const applyPreset = (presetKey) => {
    const preset = presetConfigs[presetKey];
    if (preset) {
      setPivotState(prevState => ({
        ...prevState,
        ...preset.config,
        data: data // Always ensure we use current data
      }));
    }
  };

  const exportToCSV = () => {
    try {
      // Convert pivot data to CSV
      const csvData = data.map(row => {
        const csvRow = {};
        Object.keys(row).forEach(key => {
          csvRow[key] = typeof row[key] === 'object' && row[key] !== null 
            ? JSON.stringify(row[key]) 
            : row[key];
        });
        return csvRow;
      });

      if (csvData.length === 0) {
        alert('Немає даних для експорту');
        return;
      }

      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma or quote
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `orders_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Помилка при експорті файлу');
    }
  };

  const saveConfiguration = () => {
    try {
      const config = {
        ...pivotState,
        data: undefined, // Don't save the actual data
        timestamp: new Date().toISOString(),
        filters: filters
      };
      
      localStorage.setItem('pivot_config_last', JSON.stringify(config));
      
      // Show success message
      alert('Конфігурацію збережено успішно!');
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Помилка при збереженні конфігурації');
    }
  };

  const loadConfiguration = () => {
    try {
      const savedConfig = localStorage.getItem('pivot_config_last');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setPivotState(prevState => ({
          ...prevState,
          ...config,
          data: data // Always use current data
        }));
        alert('Конфігурацію завантажено успішно!');
      } else {
        alert('Немає збережених конфігурацій');
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      alert('Помилка при завантаженні конфігурації');
    }
  };

  const resetToDefault = () => {
    setPivotState({
      data: data,
      aggregatorName: 'Sum',
      vals: ['quantity'],
      rows: ['product_name'],
      cols: ['delivery_date'],
      rendererName: 'Table',
      unusedOrientationCutoff: 85
    });
  };

  // Update pivot state when data changes
  React.useEffect(() => {
    setPivotState(prevState => ({
      ...prevState,
      data: data
    }));
  }, [data]);

  // Field translations for Ukrainian interface
  const fieldTranslations = {
    // Order fields
    order_id: 'ID замовлення',
    order_date: 'Дата замовлення',
    order_status: 'Статус замовлення',
    order_total: 'Сума замовлення',
    delivery_date: 'Дата доставки',
    delivery_time_slot: 'Час доставки',
    delivery_cost: 'Вартість доставки',
    
    // Customer fields
    customer_name: 'Ім\'я клієнта',
    customer_type: 'Тип клієнта',
    customer_phone: 'Телефон клієнта',
    customer_email: 'Email клієнта',
    
    // Delivery fields
    delivery_type: 'Тип доставки',
    delivery_location: 'Місце доставки',
    delivery_city: 'Місто доставки',
    delivery_canton: 'Кантон',
    station_name: 'Назва станції',
    
    // Product fields
    product_name: 'Назва продукту',
    product_category: 'Категорія продукту',
    product_weight: 'Вага продукту',
    quantity: 'Кількість',
    unit_price: 'Ціна за одиницю',
    item_total: 'Загальна сума товару',
    
    // Time periods
    order_year: 'Рік замовлення',
    order_month: 'Місяць замовлення',
    order_week: 'Тиждень замовлення',
    delivery_year: 'Рік доставки',
    delivery_month: 'Місяць доставки',
    delivery_week: 'Тиждень доставки'
  };

  return (
    <Card>
      <Card.Header className="bg-primary text-white">
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center gap-2">
              <BarChart3 size={20} />
              <h5 className="mb-0">Конструктор звітів (Pivot таблиця)</h5>
            </div>
          </Col>
          <Col xs="auto">
            <ButtonGroup size="sm">
              <Button 
                variant="outline-light"
                onClick={saveConfiguration}
                title="Зберегти конфігурацію"
              >
                <Save size={16} />
              </Button>
              <Button 
                variant="outline-light"
                onClick={loadConfiguration}
                title="Завантажити конфігурацію"
              >
                <Settings size={16} />
              </Button>
              <Button 
                variant="outline-light"
                onClick={resetToDefault}
                title="Скинути до початкових налаштувань"
              >
                Скинути
              </Button>
              <Button 
                variant="outline-light"
                onClick={exportToCSV}
                title="Експорт в CSV"
              >
                <Download size={16} />
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      </Card.Header>

      <Card.Body className="p-0">
        {/* Preset Configurations */}
        <div className="p-3 bg-light border-bottom">
          <h6 className="mb-2">Готові конфігурації звітів:</h6>
          <div className="d-flex flex-wrap gap-2">
            {Object.entries(presetConfigs).map(([key, preset]) => (
              <Button
                key={key}
                variant="outline-primary"
                size="sm"
                onClick={() => applyPreset(key)}
                className="mb-1"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Data Info */}
        <div className="p-2 bg-info bg-opacity-10 border-bottom">
          <small className="text-muted">
            <strong>Дані:</strong> {data.length} записів | 
            <strong> Період:</strong> {
              filters.startDate && filters.endDate 
                ? `${new Date(filters.startDate).toLocaleDateString('uk-UA')} - ${new Date(filters.endDate).toLocaleDateString('uk-UA')}`
                : 'Всі дати'
            }
            {filters.status !== 'all' && (
              <span> | <strong>Статус:</strong> {filters.status}</span>
            )}
            {filters.deliveryType !== 'all' && (
              <span> | <strong>Доставка:</strong> {filters.deliveryType}</span>
            )}
          </small>
        </div>

        {/* Pivot Table */}
        <div className="pivot-container" style={{ minHeight: '500px' }}>
          {data.length > 0 ? (
            <PivotTableUI
              data={data}
              onChange={s => setPivotState(s)}
              renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
              {...pivotState}
              unusedOrientationCutoff={85}
            />
          ) : (
            <Alert variant="warning" className="m-3">
              <Alert.Heading>Немає даних для відображення</Alert.Heading>
              <p>Перевірте фільтри або наявність замовлень в системі.</p>
            </Alert>
          )}
        </div>
      </Card.Body>
      
      <Card.Footer className="bg-light">
        <Row>
          <Col>
            <small className="text-muted">
              <strong>Порада:</strong> Перетягуйте поля між зонами для створення різних звітів. 
              Використовуйте готові конфігурації для швидкого старту.
            </small>
          </Col>
          <Col xs="auto">
            <small className="text-muted">
              Останнє оновлення: {new Date().toLocaleTimeString('uk-UA')}
            </small>
          </Col>
        </Row>
      </Card.Footer>
    </Card>
  );
};

export default PivotTableContainer;