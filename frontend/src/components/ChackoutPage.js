import React, { useState, useContext} from 'react';
import { CartContext } from '../context/CartContext'; 

const CheckoutPage = () => {
  const { cartItems, totalPrice } = useContext(CartContext);
  
  // Состояния для формы
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'card',
    deliveryMethod: 'standard',
    notes: ''
  });

  // Состояния для управления процессом
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Обработчик изменений в форме
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Валидация формы
  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode'];
    return requiredFields.every(field => formData[field].trim() !== '');
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверка валидности формы
    if (!validateForm()) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    // Подготовка данных для отправки
    const orderData = {
      userId: 2, // FIXME: Подставьте реальный ID пользователя
      addressId: 1, // FIXME: Создайте адрес или используйте существующий
      status: 'PENDING',
      totalAmount: totalPrice,
      paymentStatus: 'PENDING',
      paymentMethod: 'TWINT',
      notes: formData.notes,
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        // FIXME: Очистите корзину после успешного заказа
        // clearCart();
      } else {
        setSubmitError(result.message || 'Произошла ошибка при оформлении заказа');
      }
    } catch (error) {
      setSubmitError('Ошибка сети. Пожалуйста, проверьте подключение.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Если заказ успешен, покажем сообщение
  if (submitSuccess) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Заказ оформлен!</h2>
        <p>Дякуємо за Ваше замовлення. Ми зв'яжемося з Вами найближчим часом.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Оформлення замовлення</h1>
      
      {/* Список товаров */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Ваші товари:</h2>
        {cartItems.map(item => (
          <div key={item.id} className="flex justify-between border-b py-2">
            <span>{item.title}</span>
            <span>{item.quantity} x {item.price} CHF</span>
          </div>
        ))}
        <div className="font-bold text-xl mt-4">
          Всього: {totalPrice} CHF
        </div>
      </div>

      {/* Форма оформления заказа */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="Имя"
            value={formData.firstName}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Фамилия"
            value={formData.lastName}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="tel"
          name="phone"
          placeholder="Телефон"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          name="address"
          placeholder="Адрес доставки"
          value={formData.address}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="city"
            placeholder="Город"
            value={formData.city}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="zipCode"
            placeholder="Индекс"
            value={formData.zipCode}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
        </div>

        <select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="card">TWINT</option>
          <option value="cash">CASH</option>
        </select>

        <select
          name="deliveryMethod"
          value={formData.deliveryMethod}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="standard">Стандартная доставка</option>
          <option value="express">Экспресс-доставка</option>
        </select>

        <textarea
          name="notes"
          placeholder="Дополнительные комментарии (опционально)"
          value={formData.notes}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        {submitError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Оформление...' : 'Оформить заказ'}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;