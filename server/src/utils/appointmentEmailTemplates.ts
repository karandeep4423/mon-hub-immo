// Appointment email templates
export interface AppointmentEmailData {
	clientName: string;
	agentName: string;
	appointmentType: string;
	scheduledDate: string;
	scheduledTime: string;
	clientEmail?: string;
	clientPhone?: string;
	notes?: string;
	reason?: string;
	originalScheduledDate?: string;
	originalScheduledTime?: string;
}

const typeLabels: Record<string, string> = {
	estimation: 'Estimation',
	vente: 'Mise en vente',
	achat: "Recherche d'achat",
	conseil: 'Conseil',
};

export const getNewAppointmentClientTemplate = (
	data: AppointmentEmailData,
): string => {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Demande de rendez-vous envoyée</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content { 
      padding: 30px 20px; 
      background: white;
    }
    .appointment-box {
      background: #e3f2fd;
      border-left: 4px solid #007bff;
      border-radius: 4px;
      padding: 20px;
      margin: 20px 0;
    }
    .detail-row {
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid #ddd;
    }
    .detail-label {
      font-weight: bold;
      width: 150px;
      color: #555;
    }
    .detail-value {
      color: #333;
    }
    .footer { 
      text-align: center; 
      padding: 20px; 
      font-size: 12px; 
      color: #666;
      background: #f8f9fa;
    }
    .info-box {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Demande de rendez-vous envoyée</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${data.clientName},</h2>
      <p>Votre demande de rendez-vous a bien été envoyée à <strong>${data.agentName}</strong>.</p>
      
      <div class="appointment-box">
        <h3>Détails du rendez-vous</h3>
        <div class="detail-row">
          <div class="detail-label">Type :</div>
          <div class="detail-value">${typeLabels[data.appointmentType] || data.appointmentType}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Agent :</div>
          <div class="detail-value">${data.agentName}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Date :</div>
          <div class="detail-value">${data.scheduledDate}</div>
        </div>
        <div class="detail-row" style="border-bottom: none;">
          <div class="detail-label">Heure :</div>
          <div class="detail-value">${data.scheduledTime}</div>
        </div>
      </div>
      
      <div class="info-box">
        <strong>📩 Prochaine étape :</strong><br>
        L'agent va examiner votre demande et vous recevrez un email de confirmation dès qu'il l'aura acceptée.
      </div>
      
      <p>Vous serez notifié par email une fois que l'agent aura répondu à votre demande.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
      <p>Ceci est un message automatique, merci de ne pas répondre.</p>
    </div>
  </div>
</body>
</html>
`;
};

export const getNewAppointmentAgentTemplate = (
	data: AppointmentEmailData,
): string => {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nouvelle demande de rendez-vous</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #28a745, #1e7e34);
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content { 
      padding: 30px 20px; 
      background: white;
    }
    .appointment-box {
      background: #d4edda;
      border-left: 4px solid #28a745;
      border-radius: 4px;
      padding: 20px;
      margin: 20px 0;
    }
    .client-box {
      background: #e3f2fd;
      border-left: 4px solid #007bff;
      border-radius: 4px;
      padding: 20px;
      margin: 20px 0;
    }
    .detail-row {
      padding: 8px 0;
      border-bottom: 1px solid #ddd;
    }
    .detail-label {
      font-weight: bold;
      color: #555;
      display: inline-block;
      width: 150px;
    }
    .detail-value {
      color: #333;
    }
    .footer { 
      text-align: center; 
      padding: 20px; 
      font-size: 12px; 
      color: #666;
      background: #f8f9fa;
    }
    .action-box {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Nouvelle demande de rendez-vous</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${data.agentName},</h2>
      <p>Vous avez reçu une nouvelle demande de rendez-vous.</p>
      
      <div class="client-box">
        <h3>Informations client</h3>
        <div class="detail-row">
          <span class="detail-label">Nom :</span>
          <span class="detail-value">${data.clientName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email :</span>
          <span class="detail-value">${data.clientEmail || 'N/A'}</span>
        </div>
        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">Téléphone :</span>
          <span class="detail-value">${data.clientPhone || 'N/A'}</span>
        </div>
      </div>

      <div class="appointment-box">
        <h3>Détails du rendez-vous</h3>
        <div class="detail-row">
          <span class="detail-label">Type :</span>
          <span class="detail-value">${typeLabels[data.appointmentType] || data.appointmentType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date :</span>
          <span class="detail-value">${data.scheduledDate}</span>
        </div>
        <div class="detail-row" style="border-bottom: ${data.notes ? '1px solid #ddd' : 'none'};">
          <span class="detail-label">Heure :</span>
          <span class="detail-value">${data.scheduledTime}</span>
        </div>
        ${
			data.notes
				? `
        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">Notes :</span>
          <span class="detail-value">${data.notes}</span>
        </div>
        `
				: ''
		}
      </div>
      
      <div class="action-box">
        <strong>📊 Action requise :</strong><br>
        Connectez-vous à votre tableau de bord pour accepter ou refuser ce rendez-vous.
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
      <p>Ceci est un message automatique, merci de ne pas répondre.</p>
    </div>
  </div>
</body>
</html>
`;
};

export const getAppointmentConfirmedTemplate = (
	data: AppointmentEmailData,
): string => {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rendez-vous confirmé</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #28a745, #1e7e34);
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content { 
      padding: 30px 20px; 
      background: white;
    }
    .success-box {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
    .checkmark {
      font-size: 48px;
      color: #28a745;
      margin-bottom: 10px;
    }
    .appointment-box {
      background: #e3f2fd;
      border-left: 4px solid #007bff;
      border-radius: 4px;
      padding: 20px;
      margin: 20px 0;
    }
    .detail-row {
      padding: 10px 0;
      border-bottom: 1px solid #ddd;
    }
    .detail-label {
      font-weight: bold;
      width: 150px;
      display: inline-block;
      color: #555;
    }
    .detail-value {
      color: #333;
    }
    .footer { 
      text-align: center; 
      padding: 20px; 
      font-size: 12px; 
      color: #666;
      background: #f8f9fa;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Rendez-vous confirmé</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${data.clientName},</h2>
      
      <div class="success-box">
        <div class="checkmark">✓</div>
        <h3>Votre rendez-vous a été confirmé !</h3>
      </div>
      
      <p><strong>${data.agentName}</strong> a accepté votre demande de rendez-vous.</p>
      
      <div class="appointment-box">
        <h3>Détails du rendez-vous</h3>
        <div class="detail-row">
          <span class="detail-label">Type :</span>
          <span class="detail-value">${typeLabels[data.appointmentType] || data.appointmentType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Agent :</span>
          <span class="detail-value">${data.agentName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date :</span>
          <span class="detail-value">${data.scheduledDate}</span>
        </div>
        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">Heure :</span>
          <span class="detail-value">${data.scheduledTime}</span>
        </div>
      </div>
      
      <p><strong>Nous vous attendons !</strong> Si vous avez des questions, n'hésitez pas à contacter l'agent.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
      <p>Ceci est un message automatique, merci de ne pas répondre.</p>
    </div>
  </div>
</body>
</html>
`;
};

export const getAppointmentRejectedTemplate = (
	data: AppointmentEmailData,
): string => {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rendez-vous refusé</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #dc3545, #a71e2a);
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content { 
      padding: 30px 20px; 
      background: white;
    }
    .appointment-box {
      background: #f8d7da;
      border-left: 4px solid #dc3545;
      border-radius: 4px;
      padding: 20px;
      margin: 20px 0;
    }
    .detail-row {
      padding: 10px 0;
      border-bottom: 1px solid #ddd;
    }
    .detail-label {
      font-weight: bold;
      width: 150px;
      display: inline-block;
      color: #555;
    }
    .detail-value {
      color: #333;
    }
    .footer { 
      text-align: center; 
      padding: 20px; 
      font-size: 12px; 
      color: #666;
      background: #f8f9fa;
    }
    .info-box {
      background: #e3f2fd;
      border-left: 4px solid #007bff;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Rendez-vous refusé</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${data.clientName},</h2>
      
      <p>Malheureusement, <strong>${data.agentName}</strong> n'a pas pu accepter votre demande de rendez-vous.</p>
      
      <div class="appointment-box">
        <h3>Détails du rendez-vous refusé</h3>
        <div class="detail-row">
          <span class="detail-label">Type :</span>
          <span class="detail-value">${typeLabels[data.appointmentType] || data.appointmentType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Agent :</span>
          <span class="detail-value">${data.agentName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date :</span>
          <span class="detail-value">${data.scheduledDate}</span>
        </div>
        <div class="detail-row" style="border-bottom: ${data.reason ? '1px solid #ddd' : 'none'};">
          <span class="detail-label">Heure :</span>
          <span class="detail-value">${data.scheduledTime}</span>
        </div>
        ${
			data.reason
				? `
        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">Raison :</span>
          <span class="detail-value">${data.reason}</span>
        </div>
        `
				: ''
		}
      </div>
      
      <div class="info-box">
        <strong>💡 Que faire maintenant ?</strong><br>
        Vous pouvez essayer de prendre rendez-vous avec un autre agent ou choisir une autre date.
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
      <p>Ceci est un message automatique, merci de ne pas répondre.</p>
    </div>
  </div>
</body>
</html>
`;
};

export const getAppointmentCancelledTemplate = (
	data: AppointmentEmailData,
): string => {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rendez-vous annulé</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #ffc107, #e0a800);
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content { 
      padding: 30px 20px; 
      background: white;
    }
    .appointment-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
      padding: 20px;
      margin: 20px 0;
    }
    .detail-row {
      padding: 10px 0;
      border-bottom: 1px solid #ddd;
    }
    .detail-label {
      font-weight: bold;
      width: 150px;
      display: inline-block;
      color: #555;
    }
    .detail-value {
      color: #333;
    }
    .footer { 
      text-align: center; 
      padding: 20px; 
      font-size: 12px; 
      color: #666;
      background: #f8f9fa;
    }
    .info-box {
      background: #e3f2fd;
      border-left: 4px solid #007bff;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Rendez-vous annulé</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${data.clientName},</h2>
      
      <p>Votre rendez-vous avec <strong>${data.agentName}</strong> a été annulé.</p>
      
      <div class="appointment-box">
        <h3>Détails du rendez-vous annulé</h3>
        <div class="detail-row">
          <span class="detail-label">Type :</span>
          <span class="detail-value">${typeLabels[data.appointmentType] || data.appointmentType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Agent :</span>
          <span class="detail-value">${data.agentName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date :</span>
          <span class="detail-value">${data.scheduledDate}</span>
        </div>
        <div class="detail-row" style="border-bottom: ${data.reason ? '1px solid #ddd' : 'none'};">
          <span class="detail-label">Heure :</span>
          <span class="detail-value">${data.scheduledTime}</span>
        </div>
        ${
			data.reason
				? `
        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">Raison :</span>
          <span class="detail-value">${data.reason}</span>
        </div>
        `
				: ''
		}
      </div>
      
      <div class="info-box">
        <strong>💡 Que faire maintenant ?</strong><br>
        Vous pouvez prendre un nouveau rendez-vous en visitant notre plateforme.
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
      <p>Ceci est un message automatique, merci de ne pas répondre.</p>
    </div>
  </div>
</body>
</html>
`;
};

export const getAppointmentRescheduledTemplate = (
	data: AppointmentEmailData,
): string => {
	return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rendez-vous reporté</title>
  <style>
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, #ff9800, #f57c00);
      color: white; 
      padding: 30px 20px; 
      text-align: center;
    }
    .header h1 { 
      margin: 0; 
      font-size: 28px;
    }
    .content { 
      padding: 30px; 
    }
    .content h2 {
      color: #333;
      font-size: 22px;
      margin-top: 0;
    }
    .appointment-box { 
      background: #fff3e0;
      border-left: 4px solid #ff9800;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .appointment-box h3 {
      margin-top: 0;
      color: #f57c00;
      font-size: 18px;
    }
    .comparison-container {
      display: flex;
      gap: 20px;
      margin: 20px 0;
    }
    .date-column {
      flex: 1;
      padding: 15px;
      border-radius: 4px;
    }
    .old-date {
      background: #ffebee;
      border: 2px solid #ef5350;
      text-decoration: line-through;
      opacity: 0.7;
    }
    .new-date {
      background: #e8f5e9;
      border: 2px solid #66bb6a;
    }
    .date-label {
      font-weight: bold;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 10px;
      display: block;
    }
    .old-date .date-label {
      color: #c62828;
    }
    .new-date .date-label {
      color: #2e7d32;
    }
    .detail-row { 
      padding: 10px 0;
      border-bottom: 1px solid #ddd;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label { 
      font-weight: bold;
      color: #666;
      min-width: 120px;
      display: inline-block;
    }
    .detail-value { 
      color: #333;
    }
    .info-box { 
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin: 20px 0;
    }
    .footer { 
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Rendez-vous reporté</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${data.clientName},</h2>
      
      <p>Votre rendez-vous avec <strong>${data.agentName}</strong> a été reporté à une nouvelle date.</p>
      
      <div class="comparison-container">
        <div class="date-column old-date">
          <span class="date-label">❌ Ancienne date</span>
          <div class="detail-row">
            <span class="detail-label">Date :</span>
            <span class="detail-value">${data.originalScheduledDate || 'N/A'}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Heure :</span>
            <span class="detail-value">${data.originalScheduledTime || 'N/A'}</span>
          </div>
        </div>
        
        <div class="date-column new-date">
          <span class="date-label">✅ Nouvelle date</span>
          <div class="detail-row">
            <span class="detail-label">Date :</span>
            <span class="detail-value">${data.scheduledDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Heure :</span>
            <span class="detail-value">${data.scheduledTime}</span>
          </div>
        </div>
      </div>
      
      <div class="appointment-box">
        <h3>Détails du rendez-vous</h3>
        <div class="detail-row">
          <span class="detail-label">Type :</span>
          <span class="detail-value">${typeLabels[data.appointmentType] || data.appointmentType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Agent :</span>
          <span class="detail-value">${data.agentName}</span>
        </div>
        ${
			data.reason
				? `
        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">Raison :</span>
          <span class="detail-value">${data.reason}</span>
        </div>
        `
				: ''
		}
      </div>
      
      <div class="info-box">
        <strong>💡 Que faire maintenant ?</strong><br>
        Votre rendez-vous est confirmé pour la nouvelle date. Si cette date ne vous convient pas, veuillez contacter directement l'agent.
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2025 MonHubImmo. Tous droits réservés.</p>
      <p>Ceci est un message automatique, merci de ne pas répondre.</p>
    </div>
  </div>
</body>
</html>
`;
};
