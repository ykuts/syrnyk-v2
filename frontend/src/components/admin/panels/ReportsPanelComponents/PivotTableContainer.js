// frontend/src/components/admin/panels/ReportsPanelComponents/PivotTableContainer.js
import React, { useState, useEffect } from 'react';
import { Card, Alert, Button, ButtonGroup, Row, Col, Modal, Form, ListGroup, Badge } from 'react-bootstrap';
import { Download, Settings, BarChart3, Save, TrendingUp, Calendar, Trash2, Star } from 'lucide-react';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import TableRenderers from 'react-pivottable/TableRenderers';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';
import './PivotTable.css';
import { apiClient } from '../../../../utils/api';

// Create the renderers including Plotly charts
const PlotlyRenderers = createPlotlyRenderers(Plot);

const PivotTableContainer = ({ data, filters }) => {
  // State for saved configurations from API
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [saveForm, setSaveForm] = useState({
    name: '',
    description: '',
    isDefault: false
  });
  
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
    customer_name: 'Імя клієнта',
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
    delivery_week: 'Тиждень доставки',
    order_day_of_week: 'День тижня замовлення',
    delivery_day_of_week: 'День тижня доставки',
    
    // Planning fields
    is_future_delivery: 'Майбутня доставка',
    delivery_planning_type: 'Тип планування',
    days_until_delivery: 'Днів до доставки',
    week_of_year: 'Тиждень року'
  };

  // Function to translate data field names
  const translateData = (originalData) => {
    if (!originalData || originalData.length === 0) return [];
    
    return originalData.map(row => {
      const translatedRow = {};
      Object.keys(row).forEach(key => {
        const translatedKey = fieldTranslations[key] || key;
        translatedRow[translatedKey] = row[key];
      });
      return translatedRow;
    });
  };

  // Get translated data
  const translatedData = translateData(data);

  // Check if data includes future deliveries for planning
  const hasFutureDeliveries = data.some(row => row.is_future_delivery === true);
  const hasHistoricalData = data.some(row => row.is_future_delivery === false);

  // Default pivot configuration - adapt based on data type
  const [pivotState, setPivotState] = useState({
    data: translatedData,
    aggregatorName: 'Sum',
    vals: ['Кількість'],
    rows: ['Назва продукту'],
    cols: hasFutureDeliveries ? ['Дата доставки'] : ['Дата замовлення'],
    rendererName: 'Table',
    unusedOrientationCutoff: 85
  });

  // Update pivot state when data changes
  useEffect(() => {
    setPivotState(prev => ({
      ...prev,
      data: translatedData,
      cols: hasFutureDeliveries ? ['Дата доставки'] : ['Дата замовлення']
    }));
  }, [translatedData, hasFutureDeliveries]);

  // Load saved configurations on component mount
  useEffect(() => {
    loadSavedConfigurations();
  }, []);

  // Load default configuration on mount
  useEffect(() => {
  
  if (translatedData && translatedData.length > 0 && !window.defaultConfigLoaded) {
    loadDefaultConfiguration();
    window.defaultConfigLoaded = true; // Загрузить только один раз
  }
}, [translatedData]);

  // Predefined configurations for common reports
  const presetConfigs = {
    production_planning: {
      name: 'Планування виробництва',
      description: 'Аналіз потреб у виробництві за продуктами та датами',
      config: {
        aggregatorName: 'Sum',
        vals: ['Кількість'],
        rows: ['Назва продукту', 'Категорія продукту'],
        cols: ['Дата доставки'],
        rendererName: 'Table'
      },
      icon: <BarChart3 size={16} />
    },
    future_delivery_planning: {
      name: 'Планування майбутніх доставок',
      description: 'Розподіл майбутніх доставок за датами та типами',
      config: {
        aggregatorName: 'Count',
        vals: [],
        rows: ['Дата доставки', 'Тип доставки'],
        cols: ['Статус замовлення'],
        rendererName: 'Table Heatmap'
      },
      icon: <TrendingUp size={16} />,
      requiresFuture: true
    },
    weekly_production_schedule: {
      name: 'Тижневий план виробництва',
      description: 'Планування виробництва по тижнях',
      config: {
        aggregatorName: 'Sum',
        vals: ['Кількість'],
        rows: ['Назва продукту'],
        cols: ['Тиждень доставки'],
        rendererName: 'Table'
      },
      icon: <Calendar size={16} />,
      requiresFuture: true
    },
    station_delivery: {
      name: 'Доставка на станції',
      description: 'Планування доставок на залізничні станції',
      config: {
        aggregatorName: 'Count',
        vals: [],
        rows: ['Назва станції', 'Дата доставки'],
        cols: ['Назва продукту'],
        rendererName: 'Table'
      },
      icon: <Settings size={16} />
    },
    delivery_by_canton: {
      name: 'Доставка по кантонах',
      description: 'Аналіз доставок за кантонами та містами',
      config: {
        aggregatorName: 'Count',
        vals: [],
        rows: ['Кантон', 'Місто доставки'],
        cols: ['Тип доставки'],
        rendererName: 'Table'
      },
      icon: <Settings size={16} />
    }
  };

  // API Functions
  const loadSavedConfigurations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/pivot-configs');
      if (response.success) {
        setSavedConfigs(response.data);
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultConfiguration = async () => {
  // ДОБАВЬТЕ ЭТУ ПРОВЕРКУ ДЛЯ ОСТАНОВКИ ЦИКЛА
  if (window.defaultConfigLoading) {
    console.log('⚠️ Default config loading already in progress, skipping');
    return;
  }
  
  window.defaultConfigLoading = true;
  
  try {
    console.log('🔍 Loading default configuration...');
    const response = await apiClient.get('/pivot-configs/default');
    console.log('📥 Response received:', response);
    
    if (response.success && response.data) {
      console.log('✅ Applying default configuration:', response.data.name);
      setPivotState(prev => ({
        ...prev,
        ...response.data.configuration,
        data: translatedData
      }));
    } else {
      console.log('ℹ️ No default configuration found');
    }
  } catch (error) {
    console.error('❌ Error loading default configuration:', error);
    // НЕ ПОКАЗЫВАЙТЕ АЛЕРТ ПРИ ОШИБКЕ - ЭТО МОЖЕТ ВЫЗВАТЬ ЕЩЕ БОЛЬШЕ ЗАПРОСОВ
  } finally {
    window.defaultConfigLoading = false;
    
    // ДОБАВЬТЕ ЗАДЕРЖКУ ПЕРЕД СЛЕДУЮЩЕЙ ПОПЫТКОЙ
    setTimeout(() => {
      window.defaultConfigLoading = false;
    }, 5000); // 5 секунд задержки
  }
};

  const saveConfiguration = async () => {
    try {
      setLoading(true);
      
      const configToSave = {
        name: saveForm.name,
        description: saveForm.description,
        configuration: {
          aggregatorName: pivotState.aggregatorName,
          vals: pivotState.vals,
          rows: pivotState.rows,
          cols: pivotState.cols,
          rendererName: pivotState.rendererName,
          unusedOrientationCutoff: pivotState.unusedOrientationCutoff
        },
        filters: filters,
        isDefault: saveForm.isDefault
      };

      const response = await apiClient.post('/pivot-configs', configToSave);
      
      if (response.success) {
        await loadSavedConfigurations();
        setShowSaveModal(false);
        setSaveForm({ name: '', description: '', isDefault: false });
        alert(`Конфігурацію "${saveForm.name}" збережено успішно!`);
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      if (error.response?.status === 409) {
        alert('Конфігурація з такою назвою вже існує');
      } else {
        alert('Помилка при збереженні конфігурації');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadConfiguration = async (config) => {
    try {
      setPivotState(prev => ({
        ...prev,
        ...config.configuration,
        data: translatedData
      }));
      setShowLoadModal(false);
      alert(`Конфігурацію "${config.name}" завантажено успішно!`);
    } catch (error) {
      console.error('Error loading configuration:', error);
      alert('Помилка при завантаженні конфігурації');
    }
  };

  const deleteConfiguration = async (configId, configName) => {
    try {
      if (!window.confirm(`Ви впевнені, що хочете видалити конфігурацію "${configName}"?`)) {
        return;
      }

      const response = await apiClient.delete(`/pivot-configs/${configId}`);
      
      if (response.success) {
        await loadSavedConfigurations();
        alert(`Конфігурацію "${configName}" видалено успішно!`);
      }
    } catch (error) {
      console.error('Error deleting configuration:', error);
      alert('Помилка при видаленні конфігурації');
    }
  };

  const setAsDefault = async (configId, configName) => {
    try {
      const response = await apiClient.put(`/pivot-configs/${configId}`, {
        isDefault: true
      });
      
      if (response.success) {
        await loadSavedConfigurations();
        alert(`"${configName}" встановлено як конфігурацію за замовчуванням!`);
      }
    } catch (error) {
      console.error('Error setting default configuration:', error);
      alert('Помилка при встановленні конфігурації за замовчуванням');
    }
  };

  // Filter configurations based on available data
  const getAvailableConfigs = () => {
    return Object.entries(presetConfigs).filter(([key, config]) => {
      if (config.requiresFuture && !hasFutureDeliveries) {
        return false;
      }
      return true;
    });
  };

  const applyPreset = (presetKey) => {
    const preset = presetConfigs[presetKey];
    if (preset) {
      setPivotState(prevState => ({
        ...prevState,
        ...preset.config
      }));
    }
  };

  const resetToDefault = () => {
    setPivotState({
      data: translatedData,
      aggregatorName: 'Sum',
      vals: ['Кількість'],
      rows: ['Назва продукту'],
      cols: hasFutureDeliveries ? ['Дата доставки'] : ['Дата замовлення'],
      rendererName: 'Table',
      unusedOrientationCutoff: 85
    });
  };

  // Export function
  const exportToCSV = () => {
    try {
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

  // Enhanced pivot state change handler
  const handlePivotChange = (newState) => {
    console.log('Pivot state changing:', newState);
    setPivotState(newState);
  };

  const pivotKey = React.useMemo(() => {
    return `pivot-${data.length}-${JSON.stringify(filters)}`;
  }, [data.length, filters]);

  // Check if we have data to display
  const hasData = translatedData && translatedData.length > 0;

  return (
    <>
      <Card className="mt-4">
        <Card.Header className="bg-primary text-white">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">
                <BarChart3 className="me-2" size={20} />
                Аналітична таблиця {hasFutureDeliveries ? '(Включає планування)' : '(Історичні дані)'}
              </h5>
            </Col>
            <Col xs="auto">
              <ButtonGroup size="sm">
                <Button 
                  variant="light" 
                  onClick={() => setShowSaveModal(true)}
                  title="Зберегти конфігурацію"
                  disabled={!hasData}
                >
                  <Save size={16} />
                </Button>
                <Button 
                  variant="light" 
                  onClick={() => setShowLoadModal(true)}
                  title="Завантажити конфігурацію"
                  disabled={savedConfigs.length === 0}
                >
                  <Settings size={16} />
                </Button>
                <Button 
                  variant="light" 
                  onClick={resetToDefault}
                  title="Скинути до початкових налаштувань"
                >
                  Скинути
                </Button>
                <Button 
                  variant="light" 
                  onClick={exportToCSV}
                  title="Експорт в CSV"
                  disabled={!hasData}
                >
                  <Download size={16} />
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Card.Header>

        <Card.Body className="p-0">
          {/* Data Type Indicator */}
          {(hasFutureDeliveries || hasHistoricalData) && (
            <div className="p-2 bg-info bg-opacity-10 border-bottom">
              <small className="text-muted">
                <strong>Тип даних:</strong> {' '}
                {hasFutureDeliveries && hasHistoricalData && 'Історичні + Планування майбутніх доставок'}
                {hasFutureDeliveries && !hasHistoricalData && 'Тільки планування майбутніх доставок'}
                {!hasFutureDeliveries && hasHistoricalData && 'Тільки історичні дані'}
              </small>
            </div>
          )}

          {/* Saved Configurations Info */}
          {savedConfigs.length > 0 && (
            <div className="p-2 bg-success bg-opacity-10 border-bottom">
              <small className="text-success">
                <strong>💾 Збережені конфігурації ({savedConfigs.length}):</strong> {savedConfigs.map(c => c.name).join(', ')}
                {savedConfigs.some(c => c.isDefault) && (
                  <span className="ms-2">
                    <Star size={12} className="text-warning" />
                    За замовчуванням: {savedConfigs.find(c => c.isDefault)?.name}
                  </span>
                )}
              </small>
            </div>
          )}

          {/* Preset Configurations */}
          <div className="p-3 bg-light border-bottom">
            <h6 className="mb-2">Готові конфігурації звітів:</h6>
            <div className="row g-2">
              {getAvailableConfigs().map(([key, preset]) => (
                <div key={key} className="col-md-6 col-lg-4">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => applyPreset(key)}
                    className="w-100 text-start d-flex align-items-center gap-2"
                    title={preset.description}
                  >
                    {preset.icon}
                    <div>
                      <div className="fw-bold">{preset.name}</div>
                      <small className="text-muted">{preset.description}</small>
                    </div>
                  </Button>
                </div>
              ))}
            </div>
            
            {/* Planning-specific message */}
            {hasFutureDeliveries && (
              <Alert variant="success" className="mt-3 mb-0">
                <TrendingUp size={16} className="me-1" />
                <strong>Режим планування активний!</strong> Ви можете аналізувати майбутні доставки та планувати виробництво.
              </Alert>
            )}
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
              {hasFutureDeliveries && (
                <span> | <strong style={{color: '#28a745'}}>Включає майбутні доставки</strong></span>
              )}
            </small>
          </div>

          {/* Pivot Table */}
          {/* Pivot Table with enhanced configuration */}
      <div className="pivot-container" style={{ minHeight: '500px' }}>
        {hasData ? (
          <div key={pivotKey}>
            <PivotTableUI
              data={translatedData}
              onChange={handlePivotChange}
              renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
              {...pivotState}
              // Enhanced drag & drop configuration
              unusedOrientationCutoff={85}
              hiddenAttributes={[]} // Don't hide any attributes
              hiddenFromAggregators={[]} // All fields available for aggregation
              hiddenFromDragDrop={[]} // All fields draggable
              // Force drag & drop to be enabled
              menuLimit={500}
              // Ensure all field categories are properly configured
              sorters={{}}
              derivedAttributes={{}}
              // Add custom drag handlers
              onRefresh={(config) => {
                console.log('Pivot refreshing with config:', config);
                setPivotState(prev => ({ ...prev, ...config }));
              }}
            />
          </div>
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
                {hasFutureDeliveries ? ' Зелені конфігурації призначені для планування майбутніх доставок.' : ''}
                {savedConfigs.length > 0 && ' Збережені конфігурації доступні через кнопку налаштувань.'}
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

      {/* Save Configuration Modal */}
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Save className="me-2" size={20} />
            Зберегти конфігурацію
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Назва конфігурації <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Наприклад: План доставок на тиждень"
                value={saveForm.name}
                onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Опис (необов'язково)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Коротний опис того, для чого використовується ця конфігурація..."
                value={saveForm.description}
                onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Встановити як конфігурацію за замовчуванням"
                checked={saveForm.isDefault}
                onChange={(e) => setSaveForm(prev => ({ ...prev, isDefault: e.target.checked }))}
              />
              <Form.Text className="text-muted">
                Конфігурація за замовчуванням завантажується автоматично при відкритті звітів
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowSaveModal(false)} disabled={loading}>
            Скасувати
          </Button>
          <Button 
            variant="primary" 
            onClick={saveConfiguration}
            disabled={!saveForm.name.trim() || loading}
          >
            {loading ? 'Збереження...' : 'Зберегти'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Load Configuration Modal */}
      <Modal show={showLoadModal} onHide={() => setShowLoadModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Settings className="me-2" size={20} />
            Завантажити конфігурацію
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {savedConfigs.length === 0 ? (
            <Alert variant="info">
              <Alert.Heading>Немає збережених конфігурацій</Alert.Heading>
              <p>Створіть свою першу конфігурацію, налаштувавши pivot table та натиснувши кнопку збереження.</p>
            </Alert>
          ) : (
            <ListGroup>
              {savedConfigs.map(config => (
                <ListGroup.Item key={config.id} className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2">
                      <h6 className="mb-1">
                        {config.name}
                        {config.isDefault && (
                          <Badge bg="warning" text="dark" className="ms-2">
                            <Star size={12} /> За замовчуванням
                          </Badge>
                        )}
                      </h6>
                    </div>
                    {config.description && (
                      <p className="mb-1 text-muted small">{config.description}</p>
                    )}
                    <small className="text-muted">
                      Створено: {new Date(config.createdAt).toLocaleString('uk-UA')}
                      {config.updatedAt !== config.createdAt && (
                        <span> | Оновлено: {new Date(config.updatedAt).toLocaleString('uk-UA')}</span>
                      )}
                    </small>
                  </div>
                  <div className="d-flex gap-1">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => loadConfiguration(config)}
                      title="Завантажити конфігурацію"
                    >
                      Завантажити
                    </Button>
                    {!config.isDefault && (
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => setAsDefault(config.id, config.name)}
                        title="Встановити як за замовчуванням"
                      >
                        <Star size={14} />
                      </Button>
                    )}
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => deleteConfiguration(config.id, config.name)}
                      title="Видалити конфігурацію"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowLoadModal(false)}>
            Закрити
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PivotTableContainer;