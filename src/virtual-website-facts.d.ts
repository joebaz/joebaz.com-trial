// The site name and language the website-facts integration in
// src/website-facts.ts gives the layout. Null means undecided.
declare module "virtual:website-facts" {
  export const siteName: string | null;
  export const language: string | null;
}
