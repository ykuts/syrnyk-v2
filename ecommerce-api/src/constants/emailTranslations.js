// Complete Email translations and constants
// Path: ecommerce-api/src/constants/emailTranslations.js

export const emailSubjects = {
  welcome: {
    uk: 'Ласкаво просимо до Syrnyk!',
    en: 'Welcome to Syrnyk!',
    fr: 'Bienvenue chez Syrnyk!'
  },
  passwordReset: {
    uk: 'Запит на скидання паролю',
    en: 'Password Reset Request',
    fr: 'Demande de réinitialisation du mot de passe'
  },
  orderConfirmation: {
    uk: 'Підтвердження замовлення #{{orderId}}',
    en: 'Order Confirmation #{{orderId}}',
    fr: 'Confirmation de commande #{{orderId}}'
  },
  orderStatusUpdate: {
    uk: 'Оновлення замовлення #{{orderId}}',
    en: 'Order #{{orderId}} Status Update',
    fr: 'Mise à jour de la commande #{{orderId}}'
  },
  orderModified: {
    uk: 'Замовлення #{{orderId}} змінено та підтверджено',
    en: 'Order #{{orderId}} Modified and Confirmed',
    fr: 'Commande #{{orderId}} modifiée et confirmée'
  }
};

export const deliveryTypes = {
  uk: {
    ADDRESS: 'Доставка за адресою',
    STATION: 'Зустріч на станції',
    PICKUP: 'Самовивіз'
  },
  en: {
    ADDRESS: 'Address delivery',
    STATION: 'Station pickup',
    PICKUP: 'Store pickup'
  },
  fr: {
    ADDRESS: 'Livraison à domicile',
    STATION: 'Rendez-vous à la gare',
    PICKUP: 'Retrait en magasin'
  }
};

export const paymentMethods = {
  uk: {
    CASH: 'Готівка',
    CARD: 'Картка',
    TWINT: 'TWINT',
    BANK_TRANSFER: 'Банківський переказ'
  },
  en: {
    CASH: 'Cash',
    CARD: 'Card',
    TWINT: 'TWINT',
    BANK_TRANSFER: 'Bank transfer'
  },
  fr: {
    CASH: 'Espèces',
    CARD: 'Carte',
    TWINT: 'TWINT',
    BANK_TRANSFER: 'Virement bancaire'
  }
};

export const orderStatuses = {
  uk: {
    PENDING: 'В обробці',
    CONFIRMED: 'Підтверджено',
    DELIVERED: 'Доставлено',
    CANCELLED: 'Відмінено'
  },
  en: {
    PENDING: 'Processing',
    CONFIRMED: 'Confirmed',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled'
  },
  fr: {
    PENDING: 'En cours de traitement',
    CONFIRMED: 'Confirmé',
    DELIVERED: 'Livré',
    CANCELLED: 'Annulé'
  }
};

export const commonPhrases = {
  uk: {
    notSpecified: 'Не вказано',
    invalidDate: 'Некоректна дата',
    dateFormatError: 'Помилка форматування дати',
    addressNotSpecified: 'Адреса не вказана',
    unknownDeliveryType: 'Невідомий тип доставки',
    timeSlot: 'Часовий слот',
    apartment: 'кв.',
    store: 'Магазин',
    address: 'Адреса'
  },
  en: {
    notSpecified: 'Not specified',
    invalidDate: 'Invalid date',
    dateFormatError: 'Date formatting error',
    addressNotSpecified: 'Address not specified',
    unknownDeliveryType: 'Unknown delivery type',
    timeSlot: 'Time slot',
    apartment: 'apt.',
    store: 'Store',
    address: 'Address'
  },
  fr: {
    notSpecified: 'Non spécifié',
    invalidDate: 'Date invalide',
    dateFormatError: 'Erreur de formatage de date',
    addressNotSpecified: 'Adresse non spécifiée',
    unknownDeliveryType: 'Type de livraison inconnu',
    timeSlot: 'Créneau horaire',
    apartment: 'apt.',
    store: 'Magasin',
    address: 'Adresse'
  }
};

// Helper function to get translated text with fallback
export const getTranslatedText = (translations, language = 'uk', key) => {
  return translations[language]?.[key] || translations.uk[key] || key;
};

// Helper function to replace variables in subject templates
export const formatSubject = (subjectTemplate, variables = {}) => {
  let formatted = subjectTemplate;
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    formatted = formatted.replace(regex, variables[key]);
  });
  return formatted;
};