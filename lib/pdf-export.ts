interface TripData {
  id: string;
  city: string;
  start_date: string;
  end_date: string;
  budget_band: string;
  pace: string;
  food_prefs?: string[];
  days: Array<{
    id: string;
    day_index: number;
    theme: string;
    stops: Array<{
      id: string;
      title: string;
      address?: string;
      start_time?: string;
      duration_mins?: number;
      est_cost: number;
      url?: string;
    }>;
  }>;
}

export async function generateTripPDF(trip: TripData): Promise<void> {
  try {
    // Create PDF using browser's print functionality with custom styling
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Failed to open print window');
    }

    const htmlContent = generatePDFHTML(trip);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      // Close the window after printing
      setTimeout(() => printWindow.close(), 1000);
    };

  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
}

function generatePDFHTML(trip: TripData): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}min` : `${hours}h`;
  };

  const totalCost = trip.days.reduce((total, day) => 
    total + day.stops.reduce((dayTotal, stop) => dayTotal + (stop.est_cost || 0), 0), 0
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${trip.city} Trip Itinerary - TrailMix</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #CCF83B;
          padding-bottom: 20px;
        }
        
        .header h1 {
          margin: 0;
          font-size: 2.5rem;
          font-weight: 600;
          color: #1a1a1a;
        }
        
        .header .brand {
          font-size: 1.2rem;
          color: #666;
          margin-top: 5px;
        }
        
        .trip-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 30px;
        }
        
        .trip-info h2 {
          margin: 0 0 15px 0;
          font-size: 1.8rem;
          color: #1a1a1a;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .info-label {
          font-weight: 600;
          color: #555;
        }
        
        .food-prefs {
          margin-top: 15px;
        }
        
        .food-tag {
          display: inline-block;
          background: #e3f2fd;
          color: #1565c0;
          padding: 4px 12px;
          border-radius: 15px;
          font-size: 0.85rem;
          margin-right: 8px;
          margin-bottom: 5px;
        }
        
        .day {
          margin-bottom: 40px;
          break-inside: avoid;
        }
        
        .day-header {
          background: #CCF83B;
          color: #1a1a1a;
          padding: 15px 20px;
          border-radius: 10px 10px 0 0;
          margin-bottom: 0;
        }
        
        .day-header h3 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 600;
        }
        
        .stops {
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 10px 10px;
        }
        
        .stop {
          padding: 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          gap: 15px;
        }
        
        .stop:last-child {
          border-bottom: none;
        }
        
        .stop-bullet {
          width: 8px;
          height: 8px;
          background: #CCF83B;
          border-radius: 50%;
          margin-top: 8px;
          flex-shrink: 0;
        }
        
        .stop-content {
          flex: 1;
        }
        
        .stop-title {
          font-weight: 600;
          font-size: 1.1rem;
          margin: 0 0 5px 0;
          color: #1a1a1a;
        }
        
        .stop-address {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 8px;
        }
        
        .stop-details {
          display: flex;
          gap: 15px;
          font-size: 0.9rem;
          color: #666;
          flex-wrap: wrap;
        }
        
        .stop-cost {
          font-weight: 600;
          color: #1a1a1a;
        }
        
        .day-total {
          background: #f8f9fa;
          padding: 15px 20px;
          border-top: 1px solid #ddd;
          display: flex;
          justify-content: space-between;
          font-weight: 600;
        }
        
        .summary {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 10px;
          margin-top: 30px;
        }
        
        .summary h3 {
          margin: 0 0 15px 0;
          font-size: 1.4rem;
          color: #1a1a1a;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #ddd;
        }
        
        .summary-total {
          font-weight: 600;
          font-size: 1.2rem;
          color: #1a1a1a;
          border-top: 2px solid #CCF83B;
          margin-top: 10px;
          padding-top: 10px;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 0.9rem;
        }
        
        @page {
          margin: 1in;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${trip.city} Adventure</h1>
        <div class="brand">Generated by TrailMix ✈️</div>
      </div>
      
      <div class="trip-info">
        <h2>Trip Details</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">📅 Dates:</span>
            <span>${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">💰 Budget:</span>
            <span>${trip.budget_band.charAt(0).toUpperCase() + trip.budget_band.slice(1)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">⏱️ Pace:</span>
            <span>${trip.pace.charAt(0).toUpperCase() + trip.pace.slice(1)}</span>
          </div>
          <div class="info-item">
            <span class="info-label">📍 Days:</span>
            <span>${trip.days.length} days</span>
          </div>
        </div>
        
        ${trip.food_prefs && trip.food_prefs.length > 0 ? `
          <div class="food-prefs">
            <div class="info-label">🍽️ Food Preferences:</div>
            ${trip.food_prefs.map(pref => `<span class="food-tag">${pref}</span>`).join('')}
          </div>
        ` : ''}
      </div>
      
      ${trip.days.map(day => `
        <div class="day">
          <div class="day-header">
            <h3>Day ${day.day_index}: ${day.theme}</h3>
          </div>
          <div class="stops">
            ${day.stops.map(stop => `
              <div class="stop">
                <div class="stop-bullet"></div>
                <div class="stop-content">
                  <h4 class="stop-title">${stop.title}</h4>
                  ${stop.address ? `<div class="stop-address">📍 ${stop.address}</div>` : ''}
                  <div class="stop-details">
                    ${stop.start_time ? `<span>🕐 ${formatTime(stop.start_time)}</span>` : ''}
                    ${stop.duration_mins ? `<span>⏰ ${formatDuration(stop.duration_mins)}</span>` : ''}
                    <span class="stop-cost">💵 ${stop.est_cost > 0 ? `$${stop.est_cost}` : 'Free'}</span>
                    ${stop.url ? `<span>🔗 More info available</span>` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
            <div class="day-total">
              <span>Day ${day.day_index} Total:</span>
              <span>$${day.stops.reduce((total, stop) => total + (stop.est_cost || 0), 0)}</span>
            </div>
          </div>
        </div>
      `).join('')}
      
      <div class="summary">
        <h3>Trip Summary</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span>Total Days:</span>
            <span>${trip.days.length}</span>
          </div>
          <div class="summary-item">
            <span>Total Activities:</span>
            <span>${trip.days.reduce((total, day) => total + day.stops.length, 0)}</span>
          </div>
        </div>
        <div class="summary-item summary-total">
          <span>Estimated Total Cost:</span>
          <span>$${totalCost}</span>
        </div>
      </div>
      
      <div class="footer">
        Generated on ${new Date().toLocaleDateString()} by TrailMix - Your AI Travel Copilot
      </div>
    </body>
    </html>
  `;
}