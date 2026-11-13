import type { AppState, Deal, Demand, Supply, User } from './types';
import { addDays, today } from './lib/dates';

export const STATE_VERSION = 1;

/** Demo data. Names, prices and volumes are hypothetical, mirroring the concept doc's example. */
export function seedState(): AppState {
  const t = today();
  const d = (n: number) => addDays(t, n);
  const at = (n: number, hour = 10) => `${d(n)}T${String(hour).padStart(2, '0')}:00:00`;

  const users: User[] = [
    { id: 'b1', role: 'buyer', name: { th: 'จูซแล็บ อารีย์', en: 'Juice Lab Ari' }, kind: { th: 'ร้านน้ำผลไม้', en: 'Juice bar' }, zone: 'ari' },
    { id: 'b2', role: 'buyer', name: { th: 'ซันเพรส น้ำคั้นสด', en: 'Sun Press Juice' }, kind: { th: 'ร้านน้ำผลไม้', en: 'Juice bar' }, zone: 'ari' },
    { id: 'b3', role: 'buyer', name: { th: 'เบลนด์บาร์ พญาไท', en: 'Blend Bar Phaya Thai' }, kind: { th: 'ร้านสมูทตี้', en: 'Smoothie shop' }, zone: 'ari' },
    { id: 'b4', role: 'buyer', name: { th: 'คาเฟ่ขนมบ้านป้า', en: 'Auntie Kanom Café' }, kind: { th: 'คาเฟ่', en: 'Café' }, zone: 'ari' },
    { id: 'b5', role: 'buyer', name: { th: 'มอร์นิ่งโบวล์ บางนา', en: 'Morning Bowl Bang Na' }, kind: { th: 'คาเฟ่', en: 'Café' }, zone: 'bangna' },
    { id: 'b6', role: 'buyer', name: { th: 'ทรอปิก้า สมูทตี้ อ่อนนุช', en: 'Tropika Smoothie On Nut' }, kind: { th: 'ร้านสมูทตี้', en: 'Smoothie shop' }, zone: 'bangna' },
    { id: 'b7', role: 'buyer', name: { th: 'แผงผลไม้บ้านสวน', en: 'Ban Suan Fruit Stall' }, kind: { th: 'ร้านผลไม้สด', en: 'Fresh fruit stall' }, zone: 'sukhumvit' },
    { id: 'b8', role: 'buyer', name: { th: 'นนท์ฟรุ๊ตแปรรูป', en: 'Nont Fruit Processing' }, kind: { th: 'โรงงานแปรรูป', en: 'Processor' }, zone: 'nonthaburi' },
    { id: 'f1', role: 'farmer', name: { th: 'สวนมะม่วงลุงชัย', en: 'Lung Chai Mango Orchard' }, kind: { th: 'สวนผลไม้', en: 'Orchard' }, region: 'central' },
    { id: 'f2', role: 'farmer', name: { th: 'สหกรณ์ผลไม้ดอยงาม', en: 'Doi Ngam Fruit Co-op' }, kind: { th: 'กลุ่มเกษตรกร', en: 'Farmer co-op' }, region: 'north' },
    { id: 'f3', role: 'farmer', name: { th: 'กลุ่มสับปะรดระยอง', en: 'Rayong Pineapple Group' }, kind: { th: 'กลุ่มเกษตรกร', en: 'Farmer group' }, region: 'east' },
    { id: 'f4', role: 'farmer', name: { th: 'สวนฝรั่งคุณมะลิ', en: 'Khun Mali Guava Farm' }, kind: { th: 'สวนผลไม้', en: 'Orchard' }, region: 'central' },
  ];

  const ndm = { th: 'น้ำดอกไม้', en: 'Nam Dok Mai' };
  const supplies: Supply[] = [
    { id: 's1', farmerId: 'f1', fruit: 'mango', variety: ndm, grade: 'B', qtyKg: 400, region: 'central', availableFrom: d(-2), availableTo: d(14),
      tiers: [ { minKg: 50, price: 52 }, { minKg: 100, price: 48 }, { minKg: 200, price: 46 } ] },
    { id: 's2', farmerId: 'f2', fruit: 'mango', variety: ndm, grade: 'A', qtyKg: 600, region: 'north', availableFrom: d(-1), availableTo: d(20),
      tiers: [ { minKg: 100, price: 47 }, { minKg: 300, price: 44 } ] },
    { id: 's3', farmerId: 'f3', fruit: 'pineapple', variety: { th: 'ปัตตาเวีย', en: 'Pattavia' }, grade: 'A', qtyKg: 500, region: 'east', availableFrom: d(0), availableTo: d(21),
      tiers: [ { minKg: 80, price: 22 }, { minKg: 200, price: 19 } ] },
    { id: 's4', farmerId: 'f4', fruit: 'guava', variety: { th: 'กิมจู', en: 'Kim Ju' }, grade: 'A', qtyKg: 300, region: 'central', availableFrom: d(-3), availableTo: d(18),
      tiers: [ { minKg: 30, price: 35 }, { minKg: 100, price: 31 } ] },
    { id: 's5', farmerId: 'f1', fruit: 'mango', variety: ndm, grade: 'C', qtyKg: 300, region: 'central', availableFrom: d(0), availableTo: d(16),
      tiers: [ { minKg: 100, price: 28 }, { minKg: 250, price: 24 } ] },
  ];

  const demands: Demand[] = [
    // The concept doc's example: shops A/B/C want 30/40/50 kg of mango.
    { id: 'd1', buyerId: 'b1', fruit: 'mango', qtyKg: 30, purpose: 'juice', maxCost: 58, currentCost: 59, zone: 'ari', neededBy: d(4), status: 'open' },
    { id: 'd2', buyerId: 'b2', fruit: 'mango', qtyKg: 40, purpose: 'juice', maxCost: 57, currentCost: 59, zone: 'ari', neededBy: d(5), status: 'open' },
    { id: 'd3', buyerId: 'b3', fruit: 'mango', qtyKg: 50, purpose: 'smoothie', maxCost: 56, currentCost: 59, zone: 'ari', neededBy: d(6), status: 'open' },
    // Budget too tight: gets dropped from the pool by the conditional rules.
    { id: 'd4', buyerId: 'b4', fruit: 'mango', qtyKg: 25, purpose: 'juice', maxCost: 50, currentCost: 54, zone: 'ari', neededBy: d(5), status: 'open' },
    // Not enough volume yet: below the farmer's minimum order.
    { id: 'd5', buyerId: 'b5', fruit: 'pineapple', qtyKg: 20, purpose: 'smoothie', maxCost: 30, zone: 'bangna', neededBy: d(6), status: 'open' },
    { id: 'd6', buyerId: 'b6', fruit: 'pineapple', qtyKg: 15, purpose: 'smoothie', maxCost: 30, currentCost: 29, zone: 'bangna', neededBy: d(7), status: 'open' },
    // Viable but pricier than the buyer's current supplier: pooling is not always cheaper.
    { id: 'd7', buyerId: 'b7', fruit: 'guava', qtyKg: 40, purpose: 'fresh', maxCost: 50, currentCost: 46, zone: 'sukhumvit', neededBy: d(3), status: 'open' },
    { id: 'd8', buyerId: 'b8', fruit: 'mango', qtyKg: 150, purpose: 'processing', maxCost: 38, currentCost: 36, zone: 'nonthaburi', neededBy: d(8), status: 'open' },
    { id: 'd9', buyerId: 'b5', fruit: 'mango', qtyKg: 35, purpose: 'smoothie', maxCost: 60, zone: 'bangna', neededBy: d(10), status: 'open' },
  ];

  const hist = (id: string, supplyId: string, farmerId: string, fruit: Deal['fruit'], grade: Deal['grade'], zone: Deal['zone'], day: number,
    price: number, ship: number, lines: [string, number][]): Deal => ({
    id, supplyId, farmerId, fruit, grade, zone, deliveryDate: d(day), pricePerKg: price, shippingPerKg: ship, feePerKg: 2, status: 'completed',
    lines: lines.map(([buyerId, qtyKg], i) => ({ demandId: `${id}-${i}`, buyerId, qtyKg, confirmed: true, received: true })),
    totalKg: lines.reduce((s, [, q]) => s + q, 0),
    events: [ { at: at(day - 3, 9), key: 'ev_offered', by: farmerId }, { at: at(day, 15), key: 'ev_completed' } ],
  });

  const deals: Deal[] = [
    hist('h1', 's1', 'f1', 'mango', 'B', 'ari', -24, 48, 4.57, [ ['b1', 40], ['b2', 50], ['b3', 50] ]),
    hist('h2', 's2', 'f2', 'mango', 'A', 'sukhumvit', -17, 44, 6.75, [ ['b7', 120], ['b3', 80], ['b1', 120] ]),
    hist('h3', 's3', 'f3', 'pineapple', 'A', 'bangna', -12, 22, 7.5, [ ['b5', 60], ['b6', 60] ]),
    hist('h4', 's4', 'f4', 'guava', 'A', 'sukhumvit', -9, 31, 5.6, [ ['b7', 100] ]),
    hist('h5', 's5', 'f1', 'mango', 'C', 'nonthaburi', -5, 24, 3.38, [ ['b8', 260] ]),
    hist('h6', 's1', 'f1', 'mango', 'B', 'ari', -3, 48, 4.77, [ ['b2', 60], ['b4', 50] ]),
  ];

  return {
    version: STATE_VERSION,
    anchor: t,
    currentUserId: 'b1',
    users,
    demands,
    supplies,
    deals,
    settings: {
      feePerKg: 2,
      poolWindowDays: 3,
      shipping: {
        central: { trip: 360, perKg: 2 },
        east: { trip: 600, perKg: 2.5 },
        north: { trip: 1200, perKg: 3 },
        northeast: { trip: 1000, perKg: 3 },
      },
    },
  };
}
