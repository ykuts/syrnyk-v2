import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function getToken() {
  const response = await axios.post('https://api.sendpulse.com/oauth/access_token', {
    grant_type: 'client_credentials',
    client_id: process.env.SENDPULSE_CLIENT_ID,
    client_secret: process.env.SENDPULSE_CLIENT_SECRET
  });
  return response.data.access_token;
}

async function getContactFields() {
  const token = await getToken();
  
  const response = await axios.get('https://api.sendpulse.com/crm/v1/contacts/attributes', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log('\n📋 Доступные поля контакта:');
  response.data.data.forEach(field => {
    console.log(`   • "${field.name}" (ID: ${field.id}, Type: ${field.type})`);
  });
}

getContactFields();