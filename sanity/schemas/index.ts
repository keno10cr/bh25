import { activity } from "./activity";
import { aboutPageSettings } from "./aboutPageSettings";
import { activitiesPageSettings } from "./activitiesPageSettings";
import { blockedDate } from "./blockedDate";
import { blog } from "./blog";
import { blogPageSettings } from "./blogPageSettings";
import { blockContent } from "./blockContent";
import { contactPageSettings } from "./contactPageSettings";
import { formSubmission } from "./formSubmission";
import { homePageSettings } from "./homePageSettings";
import { jobApplication } from "./jobApplication";
import { jobPosting } from "./jobPosting";
import { jobsPage } from "./jobsPage";
import { legendItem } from "./legendItem";
import { location } from "./location";
import { property } from "./property";
import { propertyKind } from "./propertyKind";
import { review } from "./review";
import { roomType } from "./roomType";
import { stayBooking } from "./stayBooking";
import { systemSettings } from "./systemSettings";
import { villa } from "./villa";
import { villasPageSettings } from "./villasPageSettings";

export const schemaTypes = [
  // Bookable inventory
  property,
  propertyKind,
  location,
  roomType,
  blockedDate,
  stayBooking,
  systemSettings,
  // Careers
  jobsPage,
  jobPosting,
  jobApplication,
  // Existing marketing / content
  activity,
  villa,
  legendItem,
  blog,
  review,
  formSubmission,
  blockContent,
  homePageSettings,
  aboutPageSettings,
  contactPageSettings,
  activitiesPageSettings,
  blogPageSettings,
  villasPageSettings,
];
