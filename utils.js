export function buildLead(webhookValue = {}, fieldData = []) {
  const get = (name) => {
    const f = fieldData.find((x) => x && x.name === name);
    return f && Array.isArray(f.values) ? f.values[0] ?? null : null;
  };

  return {
    leadId: String(webhookValue.leadgen_id || ''),
    pageId: String(webhookValue.page_id || ''),
    formId: String(webhookValue.form_id || ''),
    createdTime: webhookValue.created_time
      ? new Date(webhookValue.created_time * 1000).toISOString()
      : null,
    email: get('email'),
    fullName: get('full_name'),
    phoneNumber: get('phone_number'),
  };
}

export async function fetchLeadData(leadgenId, context = {}, deps = {}) {
  const { pageAccessToken, leads, wss } = deps;

  const url = `https://graph.facebook.com/v25.0/${leadgenId}?access_token=${pageAccessToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    console.error('Graph API error:', JSON.stringify(data.error, null, 2));
    throw new Error(data.error.message || 'Graph API error');
  }

  console.log('Lead field data:', JSON.stringify(data.field_data, null, 2));

  const lead = buildLead(context.webhookValue ?? {}, data.field_data ?? []);
  leads.push(lead);
  console.log('Lead stored:', JSON.stringify(lead, null, 2));
  if (wss) broadcastLeads(wss, leads);
  return lead;
}

export function broadcastLeads(wss, leads) {
    const payload = JSON.stringify({ type: 'leads', count: leads.length, leads });
    for (const client of wss.clients) {
      if (client.readyState === 1) client.send(payload);
    }
    console.log(`Broadcast all leads to ${wss.clients.size} client(s), count: ${leads.length}`);
}
