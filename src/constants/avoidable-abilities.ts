export interface AvoidableAbility {
  id: number;
  name: string;
  note?: string;
}

export const AVOIDABLE_ABILITIES: Record<number, AvoidableAbility> = {
  720: { id: 720, name: 'Ice Spike' },
  1416: {
    id: 1416, // TODO: Maybe 1649?
    name: 'Poisonado', note: 'It better to Crowd Control this ability cast than to kite.'
  },
  737: { id: 737, name: 'Slicing Blades' },
  724: { id: 724, name: 'Rapid Fire' },
  1819: { id: 1819, name: 'Shattering Ice' },
  748: { id: 748, name: 'Razor Trap' },
  747: { id: 747, name: 'Cold Blooded Twist' },
  203: { id: 203, name: 'Flame Blast' },
  205: { id: 205, name: 'Glacial Sunder' },
  279: { id: 279, name: 'Eye Of Ulmorgat' },
  830: { id: 830, name: 'Armaggedon' },
  59: { id: 59, name: 'Grip', note: 'Stay <15m' },
  546: { id: 546, name: 'Salted Blade', note: 'Stack in melee' },
  275: { id: 275, name: 'Backstab', note: 'Reposition to not give your back to Nightmist Cutthroat' },
  527: { id: 527, name: 'Sunken Gale' },
  535: { id: 535, name: 'Rupture Earth' },
  57: { id: 57, name: 'Bombs Away!' },
  599: { id: 599, name: 'Wavestomp' },
  806: { id: 806, name: 'Acidic Sap' },
  793: { id: 793, name: 'Dunehunters Trap' },
  794: { id: 794, name: 'Soulpiercer' },
  781: { id: 781, name: 'Whirlwind' },
  785: { id: 785, name: 'Crescent Cleave' },
  460: { id: 460, name: 'Penumbra' },
  1664: { id: 1664, name: 'Sinnaris Judgement' },
  27: { id: 27, name: 'Volley' },
  647: { id: 647, name: 'Earthcore Upheaval' },
  301: { id: 301, name: 'Mince' },
  1645: { id: 1645, name: 'Razorlace Web' },
  470: { id: 470, name: 'Venom Spray' },
  616: { id: 616, name: 'Ball Lightning' },
  1449: { id: 1449, name: 'Grasping Vines' },
  2179: { id: 2179, name: 'Bleeding' },
  710: { id: 710, name: 'Howling Blast' },
};
