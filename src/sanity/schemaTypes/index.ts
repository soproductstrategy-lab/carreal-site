import { faqGroup, guide, realisation, service, zone } from "./documents";
import { corps, faqItem } from "./objects";
import { aboutPage, homePage, pageTexts, review, settings } from "./singletons";

export const singletonTypes = new Set(["settings", "homePage", "aboutPage", "pageTexts"]);

export const schemaTypes = [settings, homePage, aboutPage, pageTexts, review, realisation, service, zone, guide, faqGroup, corps, faqItem];
