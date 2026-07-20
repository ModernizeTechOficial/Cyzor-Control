import { AgendaEvent, EventCategory, EventType } from '../types/agenda';

// Convert Google Calendar Web Event to Cyzor AgendaEvent
export function convertGCalEventToAgendaEvent(gEvent: any): AgendaEvent {
  // Extract date and times
  let dateStr = new Date().toISOString().split('T')[0];
  let startTimeStr = '09:00';
  let endTimeStr = '10:00';

  if (gEvent.start) {
    if (gEvent.start.dateTime) {
      const startDateTime = new Date(gEvent.start.dateTime);
      dateStr = gEvent.start.dateTime.split('T')[0];
      startTimeStr = startDateTime.toTimeString().substring(0, 5);
    } else if (gEvent.start.date) {
      dateStr = gEvent.start.date;
      startTimeStr = '00:00';
    }
  }

  if (gEvent.end) {
    if (gEvent.end.dateTime) {
      const endDateTime = new Date(gEvent.end.dateTime);
      endTimeStr = endDateTime.toTimeString().substring(0, 5);
    } else if (gEvent.end.date) {
      endTimeStr = '23:59';
    }
  }

  // Determine Type (reuniao if Zoom/Meet or hangoutLink is present)
  let eventType: EventType = 'compromisso';
  const hasVideoLink = gEvent.hangoutLink || (gEvent.location && gEvent.location.includes('http'));
  if (hasVideoLink) {
    eventType = 'reuniao';
  }

  // Attachments
  const attachments: any[] = [];
  if (gEvent.hangoutLink) {
    attachments.push({
      id: `glink-${gEvent.id}`,
      name: 'Entrar no Google Meet',
      type: 'link',
      size: '0 KB',
      url: gEvent.hangoutLink
    });
  }

  return {
    id: `gcal-${gEvent.id}`,
    title: gEvent.summary || 'Compromisso Google Calendar',
    description: gEvent.description || 'Sincronizado automaticamente via Google Calendar API.',
    date: dateStr,
    startTime: startTimeStr,
    endTime: endTimeStr,
    owner: gEvent.creator?.email || 'Membro Externo',
    participants: gEvent.attendees ? gEvent.attendees.map((attendee: any) => ({
      name: attendee.displayName || attendee.email?.split('@')[0] || 'Convidado',
      role: 'Convidado Google',
      avatar: '',
      email: attendee.email
    })) : [],
    location: gEvent.location || (gEvent.hangoutLink ? 'Videochamada Google Meet' : ''),
    type: eventType,
    category: 'Administrativo',
    status: 'Agendado',
    reminder: '15m',
    recurrence: 'none',
    comments: [],
    attachments,
    checklist: [],
    history: [
      {
        id: `h-init-${gEvent.id}`,
        user: 'Google Calendar Sync',
        action: 'Importou compromisso original',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
    ],
    reservedResources: [],
    isTimeBlock: false,
    timeBlockType: 'none'
  };
}

// Fetch events from Google Calendar
export async function fetchGoogleCalendarEvents(accessToken: string): Promise<AgendaEvent[]> {
  try {
    const timeMin = new Date();
    timeMin.setMonth(timeMin.getMonth() - 2); 
    const timeMax = new Date();
    timeMax.setMonth(timeMax.getMonth() + 2);

    if (isNaN(timeMin.getTime()) || isNaN(timeMax.getTime())) {
      throw new Error('Invalid date generated for calendar range');
    }

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(timeMin.toISOString())}&timeMax=${encodeURIComponent(timeMax.toISOString())}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Google Calendar API list failed with code ${response.status}`);
    }

    const data = await response.json();
    if (data.items && Array.isArray(data.items)) {
      return data.items.map(convertGCalEventToAgendaEvent);
    }
    return [];
  } catch (error) {
    console.error('Error in fetchGoogleCalendarEvents:', error);
    throw error;
  }
}

// Create Event on Google Calendar
export async function createGoogleCalendarEvent(accessToken: string, event: Partial<AgendaEvent>): Promise<any> {
  try {
    const startIso = `${event.date}T${event.startTime || '09:00'}:00`;
    const endIso = `${event.date}T${event.endTime || '10:00'}:00`;

    const body: any = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: new Date(startIso).toISOString()
      },
      end: {
        dateTime: new Date(endIso).toISOString()
      }
    };

    if (event.participants && event.participants.length > 0) {
      body.attendees = event.participants.map(p => ({
        email: p.email || `${p.name.replace(/\s+/g, '').toLowerCase()}@cyzor.com`
      }));
    }

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Google Calendar Event creation failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createGoogleCalendarEvent:', error);
    throw error;
  }
}

// Delete Event from Google Calendar
export async function deleteGoogleCalendarEvent(accessToken: string, gcalEventId: string): Promise<boolean> {
  try {
    const cleanId = gcalEventId.replace(/^gcal-/, '');
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${cleanId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`Google Calendar Event deletion failed with status ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteGoogleCalendarEvent:', error);
    throw error;
  }
}

// Update Event on Google Calendar
export async function updateGoogleCalendarEvent(accessToken: string, event: AgendaEvent): Promise<any> {
  try {
    const cleanId = event.id.replace(/^gcal-/, '');
    const startIso = `${event.date}T${event.startTime || '09:00'}:00`;
    const endIso = `${event.date}T${event.endTime || '10:00'}:00`;

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${cleanId}`;
    
    const body: any = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: new Date(startIso).toISOString()
      },
      end: {
        dateTime: new Date(endIso).toISOString()
      }
    };

    if (event.participants && event.participants.length > 0) {
      body.attendees = event.participants.map(p => ({
        email: p.email || `${p.name.replace(/\s+/g, '').toLowerCase()}@cyzor.com`
      }));
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Google Calendar Event update failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in updateGoogleCalendarEvent:', error);
    throw error;
  }
}
