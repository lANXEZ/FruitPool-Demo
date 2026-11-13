import type { L, Purpose, RegionId, ZoneId } from './types';

/** A tradable fruit. `aliases` are extra search terms (other spellings, local names, varieties). */
export interface Fruit extends L {
  aliases?: string[];
}

/**
 * Fruits a listing or demand can name. Based on Thai Wikipedia's "รายชื่อผลไม้", kept to fruits
 * traded in Thai markets. One entry per fruit a shop would accept interchangeably: pools match on
 * this id, so near-duplicates (e.g. ส้มเขียวหวาน / ส้มสายน้ำผึ้ง) are aliases, and the exact
 * variety goes in the listing's free-text variety field.
 */
const FRUIT_DEFS = {
  // the original five keep their ids: saved demo state refers to them
  mango: { th: 'มะม่วง', en: 'Mango' },
  pineapple: { th: 'สับปะรด', en: 'Pineapple' },
  guava: { th: 'ฝรั่ง', en: 'Guava' },
  banana: { th: 'กล้วย', en: 'Banana', aliases: ['กล้วยน้ำว้า', 'กล้วยหอม', 'กล้วยไข่'] },
  passionfruit: { th: 'เสาวรส', en: 'Passion fruit' },

  durian: { th: 'ทุเรียน', en: 'Durian' },
  mangosteen: { th: 'มังคุด', en: 'Mangosteen' },
  rambutan: { th: 'เงาะ', en: 'Rambutan' },
  longan: { th: 'ลำไย', en: 'Longan' },
  lychee: { th: 'ลิ้นจี่', en: 'Lychee', aliases: ['litchi'] },
  longkong: { th: 'ลองกอง', en: 'Longkong' },
  langsat: { th: 'ลางสาด', en: 'Langsat' },
  salak: { th: 'สละ', en: 'Salak', aliases: ['snake fruit'] },
  rakum: { th: 'ระกำ', en: 'Rakum', aliases: ['salacca'] },
  jackfruit: { th: 'ขนุน', en: 'Jackfruit' },
  cempedak: { th: 'จำปาดะ', en: 'Cempedak' },
  papaya: { th: 'มะละกอ', en: 'Papaya' },
  coconut: { th: 'มะพร้าว', en: 'Coconut', aliases: ['มะพร้าวน้ำหอม', 'young coconut', 'aromatic coconut'] },
  dragonfruit: { th: 'แก้วมังกร', en: 'Dragon fruit', aliases: ['pitaya', 'pitahaya'] },
  rose_apple: { th: 'ชมพู่', en: 'Rose apple', aliases: ['wax apple', 'chomphu', 'ชมพู่ทับทิมจันทร์'] },
  sapodilla: { th: 'ละมุด', en: 'Sapodilla' },
  custard_apple: { th: 'น้อยหน่า', en: 'Custard apple', aliases: ['sugar apple'] },
  soursop: { th: 'ทุเรียนเทศ', en: 'Soursop', aliases: ['ทุเรียนน้ำ', 'guanabana'] },
  starfruit: { th: 'มะเฟือง', en: 'Star fruit', aliases: ['carambola'] },
  tamarind: { th: 'มะขาม', en: 'Tamarind', aliases: ['มะขามหวาน', 'มะขามเปรี้ยว', 'sweet tamarind'] },
  marian_plum: { th: 'มะปราง', en: 'Marian plum', aliases: ['มะยงชิด', 'มะปริง', 'plum mango', 'gandaria'] },
  santol: { th: 'กระท้อน', en: 'Santol' },
  jujube: { th: 'พุทรา', en: 'Jujube', aliases: ['พุทราจีน', 'พุทราอินเดีย'] },
  star_gooseberry: { th: 'มะยม', en: 'Star gooseberry' },
  amla: { th: 'มะขามป้อม', en: 'Indian gooseberry', aliases: ['amla'] },
  hog_plum: { th: 'มะกอก', en: 'Hog plum', aliases: ['มะกอกไทย'] },
  ambarella: { th: 'มะกอกฝรั่ง', en: 'Ambarella' },
  bilimbi: { th: 'ตะลิงปลิง', en: 'Bilimbi' },
  mafai: { th: 'มะไฟ', en: 'Burmese grape', aliases: ['mafai'] },
  bael: { th: 'มะตูม', en: 'Bael fruit' },
  mulberry: { th: 'หม่อน', en: 'Mulberry', aliases: ['ม่อน'] },
  toddy_palm: { th: 'ลูกตาล', en: 'Toddy palm fruit', aliases: ['ตาล', 'ตาลโตนด', 'palmyra', 'lontar'] },
  breadfruit: { th: 'สาเก', en: 'Breadfruit' },
  cape_gooseberry: { th: 'โทงเทงฝรั่ง', en: 'Cape gooseberry', aliases: ['physalis', 'golden berry'] },

  // citrus
  orange: { th: 'ส้ม', en: 'Orange / mandarin', aliases: ['ส้มเขียวหวาน', 'ส้มสายน้ำผึ้ง', 'ส้มเช้ง', 'tangerine', 'mandarin'] },
  pomelo: { th: 'ส้มโอ', en: 'Pomelo' },
  grapefruit: { th: 'เกรปฟรุต', en: 'Grapefruit', aliases: ['เกรปฟรูต'] },
  lime: { th: 'มะนาว', en: 'Lime' },
  lemon: { th: 'เลมอน', en: 'Lemon', aliases: ['มะนาวเหลือง'] },
  kaffir_lime: { th: 'มะกรูด', en: 'Kaffir lime', aliases: ['makrut lime'] },
  calamansi: { th: 'ส้มจี๊ด', en: 'Calamansi', aliases: ['kumquat'] },

  // melons
  watermelon: { th: 'แตงโม', en: 'Watermelon' },
  cantaloupe: { th: 'แคนตาลูป', en: 'Cantaloupe' },
  melon: { th: 'เมล่อน', en: 'Melon', aliases: ['เมลอน', 'honeydew', 'ฮันนีดิว', 'muskmelon'] },
  thai_melon: { th: 'แตงไทย', en: 'Thai melon' },

  // mostly imported or highland-grown
  avocado: { th: 'อะโวคาโด', en: 'Avocado', aliases: ['อาโวคาโด'] },
  strawberry: { th: 'สตรอว์เบอร์รี', en: 'Strawberry', aliases: ['สตรอเบอร์รี', 'สตรอเบอร์รี่'] },
  grape: { th: 'องุ่น', en: 'Grape' },
  apple: { th: 'แอปเปิล', en: 'Apple', aliases: ['แอปเปิ้ล'] },
  pear: { th: 'สาลี่', en: 'Pear', aliases: ['ลูกแพร์', 'แพร์'] },
  persimmon: { th: 'พลับ', en: 'Persimmon', aliases: ['ลูกพลับ'] },
  peach: { th: 'ลูกพีช', en: 'Peach', aliases: ['พีช', 'ท้อ'] },
  plum: { th: 'ลูกพลัม', en: 'Plum', aliases: ['พลัม'] },
  apricot: { th: 'แอปริคอต', en: 'Apricot' },
  cherry: { th: 'เชอร์รี', en: 'Cherry', aliases: ['เชอรี่'] },
  kiwi: { th: 'กีวี', en: 'Kiwi', aliases: ['kiwifruit', 'กีวี่'] },
  blueberry: { th: 'บลูเบอร์รี', en: 'Blueberry', aliases: ['บลูเบอร์รี่'] },
  raspberry: { th: 'ราสป์เบอร์รี', en: 'Raspberry', aliases: ['ราสเบอร์รี'] },
  pomegranate: { th: 'ทับทิม', en: 'Pomegranate' },
  fig: { th: 'มะเดื่อฝรั่ง', en: 'Fig', aliases: ['มะเดื่อ'] },
  date: { th: 'อินทผลัม', en: 'Date', aliases: ['อินทผาลัม'] },
} satisfies Record<string, Fruit>;

export type FruitId = keyof typeof FRUIT_DEFS;
export const FRUITS: Record<FruitId, Fruit> = FRUIT_DEFS;
export const FRUIT_IDS = Object.keys(FRUITS) as FruitId[];

export const ZONES: Record<ZoneId, L> = {
  ari: { th: 'อารีย์ / พญาไท', en: 'Ari / Phaya Thai' },
  sukhumvit: { th: 'สุขุมวิท', en: 'Sukhumvit' },
  bangna: { th: 'บางนา / อ่อนนุช', en: 'Bang Na / On Nut' },
  nonthaburi: { th: 'นนทบุรี', en: 'Nonthaburi' },
};

export const REGIONS: Record<RegionId, L> = {
  central: { th: 'ภาคกลาง', en: 'Central' },
  east: { th: 'ภาคตะวันออก', en: 'East' },
  north: { th: 'ภาคเหนือ', en: 'North' },
  northeast: { th: 'ภาคอีสาน', en: 'Northeast' },
};

export const PURPOSES: Record<Purpose, L> = {
  fresh: { th: 'ขายผลสด', en: 'Fresh sale' },
  juice: { th: 'คั้นน้ำ', en: 'Juicing' },
  smoothie: { th: 'ปั่นสมูทตี้', en: 'Smoothies' },
  processing: { th: 'แปรรูป', en: 'Processing' },
};

/** What each purpose needs from the fruit (Quality-to-Purpose). */
export const PURPOSE_NEEDS: Record<Purpose, L> = {
  fresh: { th: 'ผิวสวย ขนาดสม่ำเสมอ', en: 'Good looks, even size' },
  juice: { th: 'รสชาติและความสุกเหมาะกับการคั้น', en: 'Flavour and ripeness for pressing' },
  smoothie: { th: 'เนื้อและความสุกเหมาะกับการปั่น', en: 'Texture and ripeness for blending' },
  processing: { th: 'ตรงสเปกวัตถุดิบโรงงาน', en: 'Matches the factory spec' },
};

/** Business types offered when someone joins. */
export const BUYER_KINDS: L[] = [
  { th: 'ร้านน้ำผลไม้', en: 'Juice bar' },
  { th: 'ร้านสมูทตี้', en: 'Smoothie shop' },
  { th: 'คาเฟ่', en: 'Café' },
  { th: 'ร้านผลไม้สด', en: 'Fresh fruit stall' },
  { th: 'โรงงานแปรรูป', en: 'Processor' },
];

export const FARMER_KINDS: L[] = [
  { th: 'สวนผลไม้', en: 'Orchard' },
  { th: 'สหกรณ์การเกษตร', en: 'Farmer co-op' },
  { th: 'กลุ่มเกษตรกร', en: 'Farmer group' },
];
