// سكريبت ربط الكاليندر لتطبيق "يومي"
// ١) غيّر كلمة السر اللي تحت لأي كلمة صعبة، وحط نفس الكلمة في التطبيق (أزير ← ربط الكاليندر).
const TOKEN = 'CHANGE-ME-to-a-long-secret';

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.token !== TOKEN) return out({ error: 'unauthorized' });
  const cals = CalendarApp.getAllCalendars();
  if (p.action === 'calendars') {
    return out({ calendars: cals.map(function (c) { return { id: c.getId(), name: c.getName() }; }) });
  }
  const from = new Date(p.from + 'T00:00:00');
  const to = new Date(p.to + 'T23:59:59');
  const ids = p.ids ? p.ids.split(',') : cals.map(function (c) { return c.getId(); });
  const events = [];
  ids.forEach(function (id) {
    const c = CalendarApp.getCalendarById(id);
    if (!c) return;
    c.getEvents(from, to).forEach(function (ev) {
      if (ev.isAllDayEvent()) return;
      try { if (ev.getMyStatus() === CalendarApp.GuestStatus.NO) return; } catch (err) {}
      events.push({
        id: ev.getId() + '|' + ev.getStartTime().getTime(),
        calId: id,
        title: ev.getTitle() || 'اجتماع',
        start: ev.getStartTime().toISOString(),
        end: ev.getEndTime().toISOString()
      });
    });
  });
  return out({ events: events });
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
