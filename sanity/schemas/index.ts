import { activity } from "./activity";
import { aboutPageSettings } from "./aboutPageSettings";
import { activitiesPageSettings } from "./activitiesPageSettings";
import { blockedDate } from "./blockedDate";
import { blog } from "./blog";
import { blogPageSettings } from "./blogPageSettings";
import { blockContent } from "./blockContent";
import { contactPageSettings } from "./contactPageSettings";
import { footerSettings } from "./footerSettings";
import { formSubmission } from "./formSubmission";
import { galleryPageSettings } from "./galleryPageSettings";
import { homePageSettings } from "./homePageSettings";
import { legendItem } from "./legendItem";
import { location } from "./location";
import { navSettings } from "./navSettings";
import { property } from "./property";
import { propertyKind } from "./propertyKind";
import { review } from "./review";
import { roomType } from "./roomType";
import { stayBooking } from "./stayBooking";
import { systemSettings } from "./systemSettings";
import { villa } from "./villa";
import { villasPageSettings } from "./villasPageSettings";
import { pvgPageSettings } from "./pvgPageSettings";

export const schemaTypes = [
  // Bookable inventory
  property,
  propertyKind,
  location,
  roomType,
  blockedDate,
  stayBooking,
  systemSettings,
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
  galleryPageSettings,
  activitiesPageSettings,
  blogPageSettings,
  villasPageSettings,
  pvgPageSettings,
  navSettings,
  footerSettings,
];
