import { addIsoDays } from "../availabilityDates.js";
import { isAirbnbIcalUrl } from "./airbnbUrl.js";
import { buildPropertyCalendar } from "./buildIcs.js";
import { airbnbBlockId } from "./constants.js";
import { blocksFromIcs, readCalendarEvents, withoutMatchingRanges } from "./parseIcs.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const airbnbFeed = `BEGIN:VCALENDAR
PRODID:-//Airbnb Inc//Hosting Calendar 0.8.8//EN
VERSION:2.0
BEGIN:VEVENT
DTSTART;VALUE=DATE:20261020
DTEND;VALUE=DATE:20261025
SUMMARY:Reserved
UID:stay-1@airbnb.com
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20261001
DTEND;VALUE=DATE:20261005
SUMMARY:Reserved
UID:bh-booking-abc@blessedhouse.info
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260101
DTEND;VALUE=DATE:20260103
SUMMARY:Not available
UID:old@airbnb.com
STATUS:CANCELLED
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20200101
DTEND;VALUE=DATE:20200103
SUMMARY:Reserved
UID:ancient@airbnb.com
END:VEVENT
END:VCALENDAR`;

const imported = blocksFromIcs(airbnbFeed, { earliestIso: "2026-10-01" });
assert(imported.length === 1, `expected 1 Airbnb block, got ${imported.length}`);
assert(imported[0].uid === "stay-1@airbnb.com", "kept the wrong event");
assert(imported[0].startDate === "2026-10-20", `start ${imported[0].startDate}`);
assert(imported[0].endDate === "2026-10-24", `end ${imported[0].endDate}`);

const echoed = withoutMatchingRanges(imported, [
  { startDate: "2026-10-20", endDate: "2026-10-24" },
]);
assert(echoed.length === 0, "exact website range should be ignored");

const ics = buildPropertyCalendar({
  property: { slug: "villa-8-oso-peresozo", nameEn: "Villa 8" },
  bookings: [{ _id: "booking-1", checkIn: "2026-11-01", checkOut: "2026-11-04" }],
  blocks: [{ _id: "block-1", startDate: "2026-12-01", endDate: "2026-12-03" }],
});
assert(ics.includes("DTSTART;VALUE=DATE:20261101"), "booking start missing");
assert(ics.includes("DTEND;VALUE=DATE:20261104"), "booking checkout missing");
assert(ics.includes("DTSTART;VALUE=DATE:20261201"), "block start missing");
assert(ics.includes("DTEND;VALUE=DATE:20261204"), "block exclusive end missing");
assert(ics.includes("X-BH-ORIGIN:website"), "origin marker missing");
assert(!ics.includes("guest@"), "feed must not include guest details");

const exported = readCalendarEvents(ics);
assert(exported.length === 2, `expected 2 exported events, got ${exported.length}`);
assert(exported.every((event) => event.websiteOrigin), "export should be marked as ours");
assert(
  blocksFromIcs(ics, { earliestIso: "2026-01-01" }).length === 0,
  "website feed must not import back as Airbnb blocks"
);
const booking = exported.find((event) => event.uid.startsWith("bh-booking-"));
const block = exported.find((event) => event.uid.startsWith("bh-block-"));
assert(booking?.startDate === "2026-11-01" && booking?.endDate === "2026-11-03", "booking nights");
assert(block?.startDate === "2026-12-01" && block?.endDate === "2026-12-03", "block nights");

assert(
  isAirbnbIcalUrl("https://www.airbnb.com/calendar/ical/123.ics?s=secret"),
  "airbnb https ics"
);
assert(!isAirbnbIcalUrl("http://www.airbnb.com/calendar/ical/123.ics"), "reject http");
assert(!isAirbnbIcalUrl("https://evil.example/calendar/ical/123.ics"), "reject other hosts");
assert(!isAirbnbIcalUrl("https://www.airbnb.com/rooms/123"), "reject non ics");

assert(airbnbBlockId("property-1", "stay-1@airbnb.com") === airbnbBlockId("property-1", "stay-1@airbnb.com"), "stable id");
assert(airbnbBlockId("property-1", "a") !== airbnbBlockId("property-1", "b"), "uid changes id");
assert(addIsoDays("2026-10-01", -1) === "2026-09-30", "month boundary");

console.log("ical selftest ok");
