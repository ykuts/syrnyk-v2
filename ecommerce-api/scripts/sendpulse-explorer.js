// SendPulse CRM API Explorer Script
// This script will help you get pipeline IDs and attribute IDs from your SendPulse CRM

import axios from 'axios'; // npm install axios

// Replace with your actual credentials from SendPulse
const SENDPULSE_CLIENT_ID = '786e3e380278717b78b594761aa0f8cd';
const SENDPULSE_CLIENT_SECRET = '38c02d1d23a79670db0764fe79259bd5';
const SENDPULSE_API_BASE = 'https://api.sendpulse.com/crm/v1';

// Step 1: Get access token
async function getSendPulseToken() {
  try {
    console.log('Getting SendPulse access token...');
    
    const response = await axios.post('https://api.sendpulse.com/oauth/access_token', {
      grant_type: 'client_credentials',
      client_id: SENDPULSE_CLIENT_ID,
      client_secret: SENDPULSE_CLIENT_SECRET
    });

    console.log('Token received successfully');
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting SendPulse token:', error.response?.data || error.message);
    throw error;
  }
}

// Step 2: Get all pipelines
async function getPipelines(token) {
  try {
    console.log('\nGetting all pipelines...');
    
    const response = await axios.get(`${SENDPULSE_API_BASE}/pipelines`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('\nFound pipelines:');
    
    response.data.data.forEach(pipeline => {
      console.log(`Pipeline: "${pipeline.name}" (ID: ${pipeline.id})`);
      
      // Look for your SYRNYK pipeline
      if (pipeline.name.includes('SYRNYK') || pipeline.name.includes('Розница')) {
        console.log(`   --> This looks like your pipeline!`);
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('Error getting pipelines:', error.response?.data || error.message);
    throw error;
  }
}

// Step 3.5: Get pipeline steps (stages)
async function getPipelineSteps(token, pipelineId, pipelineName) {
  try {
    console.log(`\nGetting steps for pipeline: "${pipelineName}" (ID: ${pipelineId})`);
    
    const response = await axios.get(`${SENDPULSE_API_BASE}/pipelines/${pipelineId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log(`\nSteps for "${pipelineName}":`);
    
    if (response.data.data.steps && response.data.data.steps.length > 0) {
      response.data.data.steps.forEach(step => {
        console.log(`   • "${step.name}" (ID: ${step.id})`);
        
        // Highlight likely first step
        const name = step.name.toLowerCase();
        if (name.includes('новый') || name.includes('new') || name.includes('заказ') || name.includes('лид')) {
          console.log(`     --> This is probably your FIRST STEP!`);
        }
      });
    } else {
      console.log('   No steps found for this pipeline');
    }

    return response.data.data.steps || [];
  } catch (error) {
    console.error(`Error getting steps for pipeline ${pipelineId}:`, error.response?.data || error.message);
    return [];
  }
}
async function getPipelineAttributes(token, pipelineId, pipelineName) {
  try {
    console.log(`\nGetting attributes for pipeline: "${pipelineName}" (ID: ${pipelineId})`);
    
    const response = await axios.get(`${SENDPULSE_API_BASE}/pipelines/${pipelineId}/attributes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log(`\nAttributes for "${pipelineName}":`);
    
    if (response.data.data && response.data.data.length > 0) {
      response.data.data.forEach(attr => {
        console.log(`   • "${attr.name}" (ID: ${attr.id}, Type: ${attr.type})`);
        
        // Highlight important attributes
        const name = attr.name.toLowerCase();
        if (name.includes('сумма') || name.includes('sum') || name.includes('chf')) {
          console.log(`     --> This is probably the AMOUNT field!`);
        }
        if (name.includes('количество') || name.includes('quantity')) {
          console.log(`     --> This is probably the QUANTITY field!`);
        }
        if (name.includes('доставка') || name.includes('delivery')) {
          console.log(`     --> This is probably the DELIVERY field!`);
        }
        if (name.includes('продукт') || name.includes('product') || name.includes('товар')) {
          console.log(`     --> This is probably the PRODUCT field!`);
        }
      });
    } else {
      console.log('   No attributes found for this pipeline');
    }

    return response.data.data;
  } catch (error) {
    console.error(`Error getting attributes for pipeline ${pipelineId}:`, error.response?.data || error.message);
    return [];
  }
}

// Step 4: Get contact attributes
async function getContactAttributes(token) {
  try {
    console.log('\nGetting contact attributes...');
    
    const response = await axios.get(`${SENDPULSE_API_BASE}/contacts/attributes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('\nContact attributes:');
    
    if (response.data.data && response.data.data.length > 0) {
      response.data.data.forEach(attr => {
        console.log(`   • "${attr.name}" (ID: ${attr.id}, Type: ${attr.type})`);
      });
    } else {
      console.log('   No contact attributes found');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error getting contact attributes:', error.response?.data || error.message);
    return [];
  }
}

// Step 5: Generate code template with actual IDs
function generateCodeTemplate(pipelines, pipelineAttributes, pipelineSteps, contactAttributes) {
  console.log('\n\nGENERATED CODE TEMPLATE:');
  console.log('=====================================');
  
  // Find SYRNYK pipeline
  const syrnykPipeline = pipelines.find(p => 
    p.name.includes('SYRNYK') || p.name.includes('Розница') || p.name.includes('заказы')
  );

  if (syrnykPipeline) {
    console.log(`// Your pipeline ID for "${syrnykPipeline.name}"`);
    console.log(`const PIPELINE_ID = '${syrnykPipeline.id}';`);
    
    const steps = pipelineSteps[syrnykPipeline.id] || [];
    if (steps.length > 0) {
      console.log('\n// Pipeline steps:');
      steps.forEach(step => {
        const safeName = step.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
        console.log(`const ${safeName.toUpperCase()}_STEP_ID = '${step.id}'; // ${step.name}`);
      });
    }
    
    const attrs = pipelineAttributes[syrnykPipeline.id] || [];
    
    console.log('\n// Deal attribute IDs:');
    attrs.forEach(attr => {
      const safeName = attr.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      console.log(`const ${safeName.toUpperCase()}_ATTR_ID = '${attr.id}'; // ${attr.name}`);
    });
    
    console.log('\n// Example deal creation payload:');
    console.log('const dealPayload = {');
    console.log('  title: `${productName} - ${quantity}шт - ${customerName}`,');
    console.log(`  pipelineId: '${syrnykPipeline.id}',`);
    if (steps.length > 0) {
      console.log(`  stepId: '${steps[0].id}', // ${steps[0].name}`);
    } else {
      console.log('  stepId: \'your_step_id\', // Add step ID manually');
    }
    console.log('  price: parseFloat(orderAmount),');
    console.log('  currency: \'CHF\',');
    console.log('  contactIds: [contactId],');
    console.log('  attributes: [');
    
    attrs.forEach(attr => {
      const safeName = attr.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      console.log(`    { attributeId: '${attr.id}', value: 'your_value' }, // ${attr.name}`);
    });
    
    console.log('  ]');
    console.log('};');

    console.log('\n// For chatbot variables, use:');
    console.log('// Instead of "your_value", use: {{sum}}, {{quantity}}, {{fullname}}, etc.');
  }
}

// Main execution function
async function main() {
  try {
    console.log('🔍 SendPulse CRM API Explorer');
    console.log('================================\n');
    
    // Check if credentials are set
    if (SENDPULSE_CLIENT_ID === 'your_client_id_here' || SENDPULSE_CLIENT_SECRET === 'your_client_secret_here') {
      console.log('❌ Please set your SendPulse credentials in the script first!');
      console.log('Go to SendPulse → Settings → API to get your Client ID and Secret');
      return;
    }

    // Step 1: Get token
    const token = await getSendPulseToken();

    // Step 2: Get all pipelines
    const pipelines = await getPipelines(token);

    // Step 3: Get attributes for each pipeline (especially SYRNYK)
    const pipelineAttributes = {};
    const pipelineSteps = {};
    for (const pipeline of pipelines) {
      const attributes = await getPipelineAttributes(token, pipeline.id, pipeline.name);
      const steps = await getPipelineSteps(token, pipeline.id, pipeline.name);
      pipelineAttributes[pipeline.id] = attributes;
      pipelineSteps[pipeline.id] = steps;
    }

    // Step 4: Get contact attributes
    const contactAttributes = await getContactAttributes(token);

    // Step 5: Generate code template
    generateCodeTemplate(pipelines, pipelineAttributes, contactAttributes);

    console.log('\n\n✅ API exploration completed!');
    console.log('Copy the generated code template and use the IDs in your integration.');

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    
    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('\n🔧 Authentication error. Please check:');
      console.log('1. Your Client ID and Secret are correct');
      console.log('2. Your SendPulse account has CRM access');
      console.log('3. The API credentials have proper permissions');
    }
  }
}

// Run the script
main();




{
  "title": "23-25",
  "pipelineId": "153270",
  "stepId": "529997",
  "price": "{{sum}}",
  "currency": "CHF",
"contactId": "{{contact_id}}",
  "attributes": [
    {
      "attributeId": "922259",
      "value": "{{sum}}"
    },
    {
      "attributeId": "923279", 
      "value": "{{quantity}}"
    }
  ]
}