import type { DungeonModifier, DungeonConfig, Bounds } from '../types';

const MODIFIERS: Record<number, DungeonModifier> = {
  22: {
    name: "Eira the White Witch",
    description: "Eira the White Witch is waiting for you somewhere in the dungeon. If you challenge her in combat and defeat her, she will assist you.",
    bonus: "Defeat Eira to gain The White Witch's Boon and gain back 180 seconds to the Dungeon Timer. Eira will appear near you every 120 seconds and spawn a Winter Rune on the ground that persists for up to 30 seconds.",
    icon: "/assets/modifiers/eira_the_white_witch.jpg"
  },
  20: {
    name: "Ghorn the Avalanche",
    description: "Ghorn the Avalanche is waiting for you somewhere in the dungeon. If you challenge him in combat and defeat him, he will assist you.",
    bonus: "Defeat Ghorn to gain Ghorn's Boon and gain back 60 seconds to the Dungeon Timer. Ghorn will join you periodically while in boss encounters and help you.",
    icon: "/assets/modifiers/ghorn_the_avalanche.jpg"
  },
  21: {
    name: "Krumbug the Naughty",
    description: "Krumbug the Naughty is waiting for you somewhere in the dungeon. If you challenge him in combat and defeat him, you will gain access to his bag of tricks.",
    bonus: "Defeat Krumbug to gain Krumbug's Bag of Tricks and gain back 60 seconds to the Dungeon Timer. Each time you deal damage to any enemy, you have a chance (10 PPM) to release a wind-up mouse to charge at the enemy.",
    icon: "/assets/modifiers/krumbug_the_naughty.jpg"
  },
  6: {
    name: "Asha's Regret",
    description: "Dungeons have a Time Limit. When the Time Limit expires: Loot is reduced 1 Upgrade level, Dungeon Score is reduced.",
    bonus: null,
    icon: "/assets/modifiers/ashas_regret.jpg"
  },
  9: {
    name: "Carnage",
    description: "All incoming damage applies a bleed for 6% of damage taken on all heroes divided evenly. When a hero's health is above 90% the Carnage bleed is removed.",
    bonus: "Heroes heal for 10% of all damage dealt by any hero, divided evenly in the group. Each time a Boss is defeated, heroes gain an additional 2.5% healing from damage dealt.",
    icon: "/assets/modifiers/carnage.jpg"
  },
  12: {
    name: "Empowered Minions",
    description: "Several enemies in each dungeon are empowered, gaining +100% Health and +150% Power.",
    bonus: "Upon defeating an Empowered Minion heroes gain +20% Haste and +20% Movement Speed for 40 seconds.",
    icon: "/assets/modifiers/empowered_minions.jpg"
  },
  19: {
    name: "Shadow Lord's Trial",
    description: "The Shadow Lord has intervened, accumulating all kill score. As enemies are killed, Shadow Orbs are spawned nearby that can be collected by heroes.",
    bonus: "Upon collecting 30x Shadow Orbs, an Emissary of the Shadow Lord will arrive to challenge you. Defeating it will reward Kill Score and grant Shadow's Defeat for 60 seconds, increasing all damage dealt by 20%.",
    icon: "/assets/modifiers/shadow_lords_trial.jpg"
  },
  15: {
    name: "Stone Skin",
    description: "Non-boss enemies have 30% increased Maximum Health.",
    bonus: "Non-boss enemies explode on death, dealing 15% of their maximum health as physical damage over 6 seconds to all other enemies and bosses in an area around them.",
    icon: "/assets/modifiers/stone_skin.jpg"
  },
  5: {
    name: "Asha's Dilemma",
    description: "Dungeons have a Time Limit. When the Time Limit expires: Heroes gain bonus Spirit Generation, Dungeon Score is reduced.",
    bonus: null,
    icon: "/assets/modifiers/ashas_dilemma.jpg"
  },
  8: {
    name: "Blood Shards",
    description: "Blood Shards erupt from dying enemies, dealing 2% of their maximum health in damage to all heroes.",
    bonus: "Heroes hit by Blood Shards gain 1% Expertise for 30 seconds, stacking up to 15 times.",
    icon: "/assets/modifiers/blood_shards.jpg"
  },
  14: {
    name: "Meteor Rain",
    description: "Periodically, burning meteors crash down on heroes, splitting up into fragments that damage and stun on impact.",
    bonus: "Each time a meteor strikes the ground, heroes generate 2 Spirit towards their Spirit Ability.",
    icon: "/assets/modifiers/meteor_rain.jpg"
  },
  16: {
    name: "Ultimatum",
    description: "Bosses deal 5% more damage and have 10% more health.",
    bonus: "Heroes' ability cooldowns are reduced by 10%.",
    icon: "/assets/modifiers/ultimatum.jpg"
  },
  4: {
    name: "Vayr's Legacy",
    description: "Enemies have learned New Abilities.",
    bonus: null,
    icon: "/assets/modifiers/vayrs_legacy.jpg"
  },
  11: {
    name: "Binding Ice",
    description: "Periodically, one hero is afflicted by an icy curse. After 5 seconds the curse erupts, dealing magic damage to all heroes within the radius and rooting them for 3 seconds.",
    bonus: "Enemies hit by Binding Ice are stunned for 2 seconds. Binding Ice deals 100% increased damage against enemies.",
    icon: "/assets/modifiers/binding_ice.jpg"
  },
  13: {
    name: "Malevolent Shade",
    description: "As heroes kill enemies, eventually a Malevolent Shade will appear, reducing all damage taken by other nearby enemies by 50% and increasing their Haste by 20% until the shade is killed.",
    bonus: "Heroes instantly replenish 85% Max Health and 50% Max Mana upon defeating the Malevolent Shade.",
    icon: "/assets/modifiers/malevolent_shade.jpg"
  }
};

export function getModifier(modifierId: number): DungeonModifier {
  const modifier = MODIFIERS[modifierId];
  if (!modifier) {
    return {
      name: "Unknown modifier " + modifierId,
      description: "",
      bonus: null,
      icon: "/assets/missing.png"
    };
  }
  return modifier;
}

const DUNGEONS: Record<number, DungeonConfig> = {
  6: {
    name: 'Empyrean Sands',
    maps: {
      27: {
        bounds: {
          minX: -54023.731225,
          maxX: -18023.731225,
          minY: -28941.867716,
          maxY: 1058.132284
        },
        image: '/assets/maps/empyrean_sands_start.webp'
      },
      28: {
        bounds: {
          minX: -33554.623966,
          maxX: 30045.376034,
          minY: -21763.259801,
          maxY: 31236.740199
        },
        image: '/assets/maps/empyrean_sands_end.webp'
      }
    }
  },
  7: {
    name: 'Cithrel\'s Fall',
    maps: {
      1: {
        bounds: {
          minX: -33641.617051,
          maxX: 29958.382949,
          minY: -19570.601320,
          maxY: 33429.398680
        },
        image: '/assets/maps/cithels_fall.webp'
      }
    }
  },
  8: {
    name: 'Wyrmheart',
    maps: {
      22: {
        bounds: {
          minX: -32815.506374,
          maxX: 28184.493626,
          minY: 8640.414103,
          maxY: 33040.414103
        },
        image: '/assets/maps/wyrmheart_start.webp'
      },
      23: {
        bounds: {
          minX: -20742.485275,
          maxX: 49657.514725,
          minY: 29075.020202,
          maxY: 71315.020202
        },
        image: '/assets/maps/wyrmheart_end.webp'
      }
    },
  },
  11: {
    name: 'Everdawn Grove',
    maps: {
      26: {
        bounds: {
          minX: -37963.955527,
          maxX: 58036.044473,
          minY: -29087.317220,
          maxY: 18912.682780
        },
        image: '/assets/maps/everdawn_grove.webp'
      }
    }
  },
  12: {
    name: 'Stormwatch',
    maps: {
      20: {
        bounds: {
          minX: 6163.466128,
          maxX: 55763.466128,
          minY: -34558.297228,
          maxY: -6038.297228
        },
        image: '/assets/maps/stormwatch_1.webp'
      },
      33: {
        bounds: {
          minX: -591.410170,
          maxX: 45808.589830,
          minY: -9963.446504,
          maxY: 16716.553496
        },
        image: '/assets/maps/stormwatch_2.webp'
      }
    }
  },
  13: {
    name: 'Wraithtide Vault',
    maps: {
      10: {
        bounds: {
          minX: -11823.850496,
          maxX: 34976.149504,
          minY: -18452.656303,
          maxY: 19347.235665
        },
        image: '/assets/maps/wraithtide_vault_start_village.webp'
      },
      11: {
        bounds: {
          minX: -31578.006399,
          maxX: 12821.993601,
          minY: -18759.843923,
          maxY: 17237.752085
        },
        image: '/assets/maps/wraithtide_vault_upper_island.webp'
      },
      12: {
        bounds: {
          minX: -20581.931147,
          maxX: 1018.068853,
          minY: -38193.591506,
          maxY: -21273.591506
        },
        image: '/assets/maps/wraithtide_vault_ship.webp'
      },
      13: {
        bounds: {
          minX: -24149.326894,
          maxX: 10650.673106,
          minY: -38675.557832,
          maxY: -12575.557832
        },
        image: '/assets/maps/wraithtide_vault_jungle.webp'
      }
    }
  },
  15: {
    name: 'Sailor\'s Abyss',
    maps: {
      24: {
        bounds: {
          minX: -25760.118521,
          maxX: 35722.602182,
          minY: -21360.591415,
          maxY: 15302.768693
        },
        image: '/assets/maps/sailors_abyss.webp'
      }
    }
  },
  21: {
    name: 'Urrak Markets',
    maps: {
      29: {
        bounds: {
          minX: -43288.488172,
          maxX: 44711.511828,
          minY: -19081.419530,
          maxY: 24918.580470
        },
        image: '/assets/maps/urrak_markets.webp'
      }
    }
  },
  23: {
    name: 'Ransack of Drakheim',
    maps: {
      17: {
        bounds: {
          minX: -19008.111284,
          maxX: 50991.891635,
          minY: -7228.665600,
          maxY: 27771.334400
        },
        image: '/assets/maps/ransack_of_drakheim_start.webp'
      },
      18: {
        bounds: {
          minX: -35021.965841,
          maxX: 20978.034159,
          minY: -12875.467650,
          maxY: 15124.532350
        },
        image: '/assets/maps/ransack_of_drakheim_upper.webp'
      },
      19: {
        bounds: {
          minX: -32006.749434,
          maxX: 33690.790849,
          minY: -35152.113329,
          maxY: -2303.343188
        },
        image: '/assets/maps/ransack_of_drakheim_lower.webp'
      }
    }
  },
  24: {
    name: 'Silken Hollow',
    maps: {
      30: {
        bounds: {
          minX: -64228.321285,
          maxX: 49771.678715,
          minY: -15630.354306,
          maxY: 41369.645694
        },
        image: '/assets/maps/silken_hollow_start.webp'
      },
      31: {
        bounds: {
          minX: -18228.321333,
          maxX: 3771.678667,
          minY: 36891.221316,
          maxY: 47891.221316
        },
        image: '/assets/maps/silken_hollow_end.webp'
      }
    }
  },
  25: {
    name: 'Godfall Quarry',
    maps: {
      32: {
        bounds: {
          minX: -38728.354002,
          maxX: 69271.645998,
          minY: 47299.297944,
          maxY: 101299.297944
        },
        image: '/assets/maps/godfall_quarry.webp'
      }
    }
  }
};

export function getDungeonConfig(dungeonId: number): DungeonConfig | null {
  return DUNGEONS[dungeonId] || null;
}

export function getWorldBounds(config: DungeonConfig): Bounds {
  const mapBounds = Object.values(config.maps).map(m => m.bounds);

  return {
    minX: Math.min(...mapBounds.map(b => b.minX)),
    maxX: Math.max(...mapBounds.map(b => b.maxX)),
    minY: Math.min(...mapBounds.map(b => b.minY)),
    maxY: Math.max(...mapBounds.map(b => b.maxY))
  };
}
