export interface WebProject {
  title: string;
  slug: string;
  year: string;
  client: string;
  role: string;
  description: string;
  image: string;
  video?: string;
  width: number;
  height: number;
  aspectRatio: string;
  uniqueId?: string;
  originalIndex?: number;
}

export const WEB_PROJECTS: WebProject[] = [
  {
    title: "Nathan Riley",
    slug: "nathan-riley",
    year: "2024",
    client: "Nathan Riley",
    role: "Front-end Architecture & WebGL",
    description: "Nathan is a UK-based digital creative specializing in art direction, surrealist 3D visuals, interactive experiences, and motion design.",
    image: "https://www.datocms-assets.com/223669/1786207557-nathan-2.jpg",
    width: 2048,
    height: 1172,
    aspectRatio: "2048 / 1172",
  },
  {
    title: "Casa Di Solare",
    slug: "casa-di-solare",
    year: "2024",
    client: "Nikolas Type",
    role: "Motion Design & Creative Dev",
    description: "Solare extends Nikolas Type's Font Catalogue with a timeless, hyper-useable quintessential variable font, suitable for a wide field of applications.",
    image: "https://www.datocms-assets.com/223669/1785656645-image-84.jpg",
    width: 2048,
    height: 1204,
    aspectRatio: "2048 / 1204",
  },
  {
    title: "The Lookback",
    slug: "the-lookback",
    year: "2023",
    client: "Better Off® Studio",
    role: "Front-end Development",
    description: "Digital capsule for Better Off® studio to document what inspired them and what they created over the last months/years.",
    image: "https://www.datocms-assets.com/223669/178565633-tlb4.jpg",
    width: 1250,
    height: 720,
    aspectRatio: "1250 / 720",
  },
  {
    title: "Book of Happiness",
    slug: "book-of-happiness",
    year: "2023",
    client: "Good Work Foundation",
    role: "WebGL & Interactive Experience",
    description: "Helping leaders keep themselves and their people happy and mentally healthy through interactive storytelling.",
    image: "https://www.datocms-assets.com/223669/1786210260-book-2.jpg",
    width: 2048,
    height: 1114,
    aspectRatio: "2048 / 1114",
  },
  {
    title: "Dogelon Mars",
    slug: "dogelon-mars",
    year: "2023",
    client: "Dogelon Project",
    role: "Lead Creative Developer",
    description: "Follow the story of Dogelon Mars as he explores the greatest mysteries of the universe and seeks to return to the planet he once called home.",
    image: "https://www.datocms-assets.com/223669/1786207957-dogelon-2.jpg",
    width: 3360,
    height: 2200,
    aspectRatio: "3360 / 2200",
  },
  {
    title: "Gil Huybrecht",
    slug: "gil-huybrecht",
    year: "2023",
    client: "Gil Huybrecht",
    role: "Front-end Architecture & Animation",
    description: "Gil Huybrecht is a Belgian digital designer and art director, specializing in typography-heavy web design and branding.",
    image: "https://www.datocms-assets.com/223669/1785656909-image-64.jpg",
    width: 1196,
    height: 720,
    aspectRatio: "1196 / 720",
  },
  {
    title: "Discoveryland",
    slug: "discoveryland",
    year: "2023",
    client: "Outpost / Discovery Land",
    role: "WebGL & Motion Engineering",
    description: "Partnered with Outpost and Discovery Land Company to create an immersive brand experience across their 23 global luxury properties.",
    image: "https://www.datocms-assets.com/223669/1786432901-dlc-thumbnail.jpg",
    width: 1372,
    height: 1029,
    aspectRatio: "1372 / 1029",
  },
  {
    title: "Griflan",
    slug: "griflan",
    year: "2022",
    client: "Griflan Studio",
    role: "Lead Creative Development",
    description: "Creative studio at the intersection of design, strategy, and compelling storytelling, shaping brands that move culture and leave a lasting mark.",
    image: "https://www.datocms-assets.com/223669/1785656942-bo1.jpg",
    width: 1162,
    height: 720,
    aspectRatio: "1162 / 720",
  },
];
