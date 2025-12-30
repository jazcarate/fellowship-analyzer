export interface AvoidableAbilityMetadata {
  note?: string;
  nonTankOnly?: boolean;
}

export const AVOIDABLE_ABILITIES: Record<number, AvoidableAbilityMetadata> = {
  720: {},  // Ice Spike
  1416: { note: 'It better to Crowd Control this ability cast than to kite.' }, // Poisonado (TODO: Maybe 1649?)
  737: {},  // Slicing Blades
  724: {},  // Rapid Fire
  1819: {}, // Shattering Ice
  748: {},  // Razor Trap
  747: {},  // Cold Blooded Twist
  203: {},  // Flame Blast
  205: {},  // Glacial Sunder
  279: {},  // Eye Of Ulmorgat
  830: {},  // Armaggedon
  59: { note: 'Stay closer than 15m of the Mancatchers' }, // Grip
  546: { note: 'Stack in melee' }, // Salted Blade
  275: { note: 'Reposition to not give your back to Nightmist Cutthroat' }, // Backstab
  527: {},  // Sunken Gale
  535: {},  // Rupture Earth
  57: {},   // Bombs Away!
  599: {},  // Wavestomp
  806: {},  // Acidic Sap
  793: {},  // Dunehunters Trap
  794: {},  // Soulpiercer
  781: {},  // Whirlwind
  785: {},  // Crescent Cleave
  460: {},  // Penumbra
  1664: {}, // Sinnaris Judgement
  27: {},   // Volley
  647: {},  // Earthcore Upheaval
  301: {},  // Mince
  1645: {}, // Razorlace Web
  470: {},  // Venom Spray
  616: {},  // Ball Lightning
  1449: {}, // Grasping Vines
  2179: {}, // Bleeding
  710: {},  // Howling Blast
  838: { nonTankOnly: true, note: "Don't stand close to the tank" }, // Executioners Cleave
  534: { nonTankOnly: true, note: "Don't stand close to the tank" }, // Anchor Strike
  592: { nonTankOnly: true, note: "Don't stand close to the tank" }, // Anchor Strike
  56: { nonTankOnly: true, note: "Don't stand close to the tank" },  // Dark Cleave
  784: { nonTankOnly: true, note: "Don't stand close to the tank" }, // Attack
  458: { nonTankOnly: true, note: "Don't stand close to the tank" }, // Lunar Soulsear
  492: { nonTankOnly: true, note: "Don't stand close to the tank" }, // Wailing Strike
  1634: { nonTankOnly: true, note: "Don't stand close to the tank" }, // Forked Lightning
};
