import type { FruitId, L, Purpose, RegionId, ZoneId } from './types';

export const FRUITS: Record<FruitId, L> = {
  mango: { th: 'มะม่วง', en: 'Mango' },
  pineapple: { th: 'สับปะรด', en: 'Pineapple' },
  guava: { th: 'ฝรั่ง', en: 'Guava' },
  banana: { th: 'กล้วยน้ำว้า', en: 'Banana' },
  passionfruit: { th: 'เสาวรส', en: 'Passion fruit' },
};

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
