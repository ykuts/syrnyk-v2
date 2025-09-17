// frontend/src/components/admin/panels/ReportsPanelComponents/PivotTableContainer.js
import React, { useState, useEffect, useMemo } from 'react';
import { Card, Alert, Button, Row, Col, Modal, Form, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { Download, Settings, BarChart3, Save, TrendingUp, Calendar, Trash2, Star, RotateCcw } from 'lucide-react';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import TableRenderers from 'react-pivottable/TableRenderers';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';
import './PivotTable.css';
import { apiClient } from '../../../../utils/api';

// Create the renderers including Plotly charts
const PlotlyRenderers = createPlotlyRenderers(Plot);

const PivotTableContainer = ({ data, filters, onFiltersUpdate }) => {
  // ===== STATES =====
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Modal states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [saveForm, setSaveForm] = useState({
    name: '',
    description: '',
    isDefault: false
  });

  // Initialization flag
  const [isInitialized, setIsInitialized] = useState(false);

  // ===== FIELD TRANSLATIONS =====
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

  // ===== COMPUTED VALUES =====
  // Translate data field names
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

  const translatedData = useMemo(() => translateData(data), [data]);

  // Check data types
  const hasFutureDeliveries = useMemo(() =>
    data.some(row => row.is_future_delivery === true), [data]
  );

  const hasHistoricalData = useMemo(() =>
    data.some(row => row.is_future_delivery === false), [data]
  );

  const hasData = translatedData.length > 0;

  // ===== PIVOT STATE =====
  const [pivotState, setPivotState] = useState({
    data: [],
    aggregatorName: 'Count',
    vals: [],
    rows: ['Кантон', 'Тип доставки', 'Дата доставки', 'Назва станції', 'Імя клієнта', 'Сума замовлення'],
    cols: ['Назва продукту'],
    rendererName: 'Table Heatmap',
    unusedOrientationCutoff: 85
  });

  // ===== PRESET CONFIGURATIONS =====
  const presetConfigs = {
    basic_report: {
      name: 'Базовий звіт',
      description: 'Розподіл замовлень за датами та продукцією',
      config: {
        aggregatorName: 'Count',
        vals: [],
        rows: ['Кантон', 'Тип доставки', 'Дата доставки', 'Назва станції', 'Імя клієнта', 'Сума замовлення'],
        cols: ['Назва продукту'],
        rendererName: 'Table Heatmap'
      },
      icon: <TrendingUp size={16} />,
      requiresFuture: true
    },
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

  // ===== UTILITY FUNCTIONS =====
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const forceRefreshPivot = () => {
    const pivotContainer = document.querySelector('.pivot-container');
    if (pivotContainer) {
      pivotContainer.classList.add('pivot-refreshing');
      setTimeout(() => {
        pivotContainer.classList.remove('pivot-refreshing');
      }, 300);
    }

    setPivotState(prev => ({
      ...prev,
      _forceUpdate: Date.now()
    }));
  };

  // ===== PIVOT CONTROL FUNCTIONS =====
  const handlePivotChange = (newState) => {
    console.log('🔄 Pivot state changing:', {
      oldCols: pivotState.cols,
      newCols: newState.cols,
      oldRows: pivotState.rows,
      newRows: newState.rows
    });

    setPivotState({
      ...newState,
      data: translatedData
    });
  };

  const clearColumns = () => {
    setPivotState(prev => ({ ...prev, cols: [] }));
  };

  const clearRows = () => {
    setPivotState(prev => ({ ...prev, rows: [] }));
  };

  const resetToDefault = () => {
    setPivotState({
      data: translatedData,
      aggregatorName: 'Sum',
      vals: ['Кількість'],
      rows: ['Назва продукту'],
      cols: [],
      rendererName: 'Table',
      unusedOrientationCutoff: 85
    });
    setIsInitialized(false);
  };

  // ===== API FUNCTIONS =====
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

  const applyConfigurationToPivot = (config) => {
    try {
      console.log('🎯 Applying configuration to pivot table...');

      const newState = {
        ...config.configuration,
        data: translatedData,
        _forceUpdate: Date.now()
      };

      setPivotState(newState);
      setIsInitialized(true);

      setTimeout(() => forceRefreshPivot(), 100);

      const configDetails = [
        config.configuration.rows?.length ? `Рядки: ${config.configuration.rows.join(', ')}` : '',
        config.configuration.cols?.length ? `Колонки: ${config.configuration.cols.join(', ')}` : '',
        config.configuration.vals?.length ? `Значення: ${config.configuration.vals.join(', ')}` : '',
        config.configuration.aggregatorName ? `Агрегація: ${config.configuration.aggregatorName}` : ''
      ].filter(Boolean).join('\n');

      showSuccessMessage(`✅ Конфігурація "${config.name}" завантажена!\n${configDetails}`);

    } catch (error) {
      console.error('❌ Error applying configuration:', error);
      showSuccessMessage('❌ Помилка при застосуванні конфігурації');
    }
  };

  const loadConfiguration = async (config) => {
    try {
      setConfigLoading(true);
      console.log('🔄 Loading configuration:', config.name);

      const shouldRestoreFilters = config.filters && onFiltersUpdate;

      if (shouldRestoreFilters) {
        console.log('📅 Restoring filters from configuration...');
        showSuccessMessage('📅 Відновлюємо фільтри...');
        onFiltersUpdate(config.filters);

        setTimeout(() => {
          applyConfigurationToPivot(config);
        }, 800);
      } else {
        applyConfigurationToPivot(config);
      }

      setShowLoadModal(false);

    } catch (error) {
      console.error('❌ Error loading configuration:', error);
      showSuccessMessage('❌ Помилка при завантаженні конфігурації');
    } finally {
      setTimeout(() => setConfigLoading(false), 1000);
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

        const filterInfo = Object.entries(filters)
          .filter(([key, value]) => value && value !== 'all')
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');

        const message = `💾 Конфігурацію "${saveForm.name}" збережено!\n\n` +
          `Рядки: ${pivotState.rows?.join(', ') || 'немає'}\n` +
          `Колонки: ${pivotState.cols?.join(', ') || 'немає'}\n` +
          `Значення: ${pivotState.vals?.join(', ') || 'немає'}` +
          (filterInfo ? `\nФільтри: ${filterInfo}` : '');

        showSuccessMessage(message);
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      if (error.response?.status === 409) {
        showSuccessMessage('❌ Конфігурація з такою назвою вже існує');
      } else {
        showSuccessMessage('❌ Помилка при збереженні конфігурації');
      }
    } finally {
      setLoading(false);
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
        showSuccessMessage(`✅ Конфігурацію "${configName}" видалено успішно!`);
      }
    } catch (error) {
      console.error('Error deleting configuration:', error);
      showSuccessMessage('❌ Помилка при видаленні конфігурації');
    }
  };

  const setAsDefault = async (configId, configName) => {
    try {
      const response = await apiClient.put(`/pivot-configs/${configId}`, {
        isDefault: true
      });

      if (response.success) {
        await loadSavedConfigurations();
        showSuccessMessage(`⭐ "${configName}" встановлено як конфігурацію за замовчуванням!`);
      }
    } catch (error) {
      console.error('Error setting default configuration:', error);
      showSuccessMessage('❌ Помилка при встановленні конфігурації за замовчуванням');
    }
  };

  const applyPreset = (presetKey) => {
    const preset = presetConfigs[presetKey];
    if (preset) {
      console.log('🎯 Applying preset:', preset.name);

      const newState = {
        ...pivotState,
        ...preset.config,
        data: translatedData,
        _forceUpdate: Date.now()
      };

      setPivotState(newState);
      setIsInitialized(true);

      setTimeout(() => forceRefreshPivot(), 100);
      showSuccessMessage(`🎯 Пресет "${preset.name}" застосовано!`);
    }
  };

  const getAvailableConfigs = () => {
    return Object.entries(presetConfigs).filter(([key, config]) => {
      if (config.requiresFuture && !hasFutureDeliveries) {
        return false;
      }
      return true;
    });
  };

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

      const csvContent = "data:text/csv;charset=utf-8," +
        Object.keys(csvData[0]).join(",") + "\n" +
        csvData.map(row => Object.values(row).join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `pivot_data_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccessMessage('📊 Дані експортовано в CSV');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showSuccessMessage('❌ Помилка при експорті');
    }
  };

  // ===== EFFECTS =====
  // Initialize data
  useEffect(() => {
    if (translatedData.length > 0 && !isInitialized) {
      setPivotState(prev => ({
        ...prev,
        data: translatedData,
        cols: hasFutureDeliveries ? ['Дата доставки'] : ['Дата замовлення']
      }));
      setIsInitialized(true);
    } else if (translatedData.length > 0 && isInitialized) {
      setPivotState(prev => ({
        ...prev,
        data: translatedData
      }));
    }
  }, [translatedData, hasFutureDeliveries, isInitialized]);

  // Load saved configurations on mount
  useEffect(() => {
    loadSavedConfigurations();
  }, []);

  // ===== STATUS COMPONENT =====
  const StatusIndicator = () => {
    if (configLoading) {
      return (
        <div className="d-flex align-items-center text-primary mb-2">
          <Spinner animation="border" size="sm" className="me-2" />
          Завантажуємо конфігурацію...
        </div>
      );
    }

    if (successMessage) {
      return (
        <Alert variant="success" className="mb-2 py-2" dismissible onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      );
    }

    return null;
  };

  // ===== RENDER =====
  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">Pivot таблиця аналітики</h5>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Button
            variant="outline-warning"
            size="sm"
            onClick={clearColumns}
            title="Очистити колонки"
          >
            Очистити колонки
          </Button>
          <Button
            variant="outline-info"
            size="sm"
            onClick={clearRows}
            title="Очистити рядки"
          >
            Очистити рядки
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={resetToDefault}
            title="Скинути до початкових налаштувань"
          >
            <RotateCcw size={16} className="me-1" />
            Скинути
          </Button>
          <Button
            variant="outline-success"
            size="sm"
            onClick={() => onFiltersUpdate && onFiltersUpdate({ ...filters, _forceRefresh: Date.now() })}
            title="Оновити дані"
            disabled={!onFiltersUpdate}
          >
            <TrendingUp size={16} className="me-1" />
            Оновити дані
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowSaveModal(true)}
            title="Зберегти поточну конфігурацію"
          >
            <Save size={16} className="me-1" />
            Зберегти
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setShowLoadModal(true)}
            title="Завантажити збережену конфігурацію"
          >
            <Settings size={16} className="me-1" />
            Завантажити
          </Button>
          <Button
            variant="outline-dark"
            size="sm"
            onClick={exportToCSV}
            title="Експорт в CSV"
            disabled={!hasData}
          >
            <Download size={16} />
          </Button>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        <StatusIndicator />

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
              <span> | <strong style={{ color: '#28a745' }}>Включає майбутні доставки</strong></span>
            )}
          </small>
        </div>

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

          {hasFutureDeliveries && (
            <Alert variant="success" className="mt-3 mb-0">
              <TrendingUp size={16} className="me-1" />
              <strong>Режим планування активний!</strong> Ви можете аналізувати майбутні доставки та планувати виробництво.
            </Alert>
          )}
        </div>

        {/* Pivot Table */}
        <div className="pivot-container" style={{ minHeight: '500px' }}>
          {hasData ? (
            <PivotTableUI
              data={translatedData}
              onChange={handlePivotChange}
              renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
              {...pivotState}
              unusedOrientationCutoff={85}
              hiddenAttributes={[]}
              hiddenFromAggregators={[]}
              hiddenFromDragDrop={[]}
              key={`pivot-${isInitialized}-${translatedData.length}`}
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
              {hasFutureDeliveries ? ' Зелені конфігурації призначені для планування майбутніх доставок.' : ''}
              {savedConfigs.length > 0 && ' Збережені конфігурації доступні через кнопку налаштувань.'}
            </small>
          </Col>
        </Row>
      </Card.Footer>

      {/* Save Modal */}
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
              <Form.Label>Назва конфігурації *</Form.Label>
              <Form.Control
                type="text"
                value={saveForm.name}
                onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Введіть назву конфігурації"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Опис (необов'язково)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={saveForm.description}
                onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Короткий опис конфігурації"
              />
            </Form.Group>
            <Form.Check
              type="checkbox"
              id="default-config"
              label="Встановити як конфігурацію за замовчуванням"
              checked={saveForm.isDefault}
              onChange={(e) => setSaveForm(prev => ({ ...prev, isDefault: e.target.checked }))}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowSaveModal(false)}>
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

      {/* Load Modal */}
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
                      disabled={configLoading}
                    >
                      {configLoading ? <Spinner animation="border" size="sm" /> : 'Завантажити'}
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
    </Card>
  );
};

export default PivotTableContainer;