const customEventFilter = ["Review Youtrack"];
import { calendar } from "@googleapis/calendar";

// export async function getCalendar(token:string) {
export async function getCalendar(
  auth: any,
  { since, until }: { since: string; until: string }
): Promise<{ date: string; data: any }[]> {
  const { data } = await calendar({ version: "v3", auth }).events.list({
    calendarId: "primary",
    singleEvents: true,
    timeMin: since,
    timeMax: until,
  });

  return data
    .items!.filter(
      (i) =>
        i.eventType !== "workingLocation" &&
        !customEventFilter.includes(i.summary ?? "") &&
        i.attendees?.filter((a) => a.self)[0]?.responseStatus === "accepted"
    )
    .map((i) => ({
      data: {
        summary: i.summary!,
        start: i.start!.dateTime!,
        end: i.end!.dateTime!,
        type: "event",
      },
      date: i.start!.dateTime!,
    }));
}
