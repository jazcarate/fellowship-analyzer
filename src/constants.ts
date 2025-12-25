import type { Hero, DungeonModifier, Ability, DungeonConfig } from './types';

const HEROES: Record<number, Hero> = {
  22: { name: 'Helena', color: '#b46831', icon: '/assets/heroes/helena.jpg', order: 0 },
  13: { name: 'Meiko', color: '#28e05c', icon: '/assets/heroes/meiko.jpg', order: 1 },
  14: { name: 'Sylvie', color: '#EA4F85', icon: '/assets/heroes/sylvie.jpg', order: 2 },
  20: { name: 'Vigour', color: '#dddbc5', icon: '/assets/heroes/vigour.jpg', order: 3 },
  7: { name: 'Ardeos', color: '#eb6332', icon: '/assets/heroes/ardeos.jpg', order: 4 },
  2: { name: 'Elarion', color: '#935dff', icon: '/assets/heroes/elarion.jpg', order: 5 },
  11: { name: 'Mara', color: '#965a90', icon: '/assets/heroes/mara.jpg', order: 6 },
  17: { name: 'Rime', color: '#1ea3ee', icon: '/assets/heroes/rime.jpg', order: 7 },
  10: { name: 'Tariq', color: '#527af5', icon: '/assets/heroes/tariq.jpg', order: 8 }
};

export function getHero(heroId: number): Hero {
  const hero = HEROES[heroId];
  if (!hero) throw new Error("No hero found with id: " + heroId);
  return hero;
}

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

const ABILITIES: Record<number, Ability> = {
  1465: {
    name: 'Grand Melee',
    icon: '/assets/abilities/grand_melee.jpg',
    getCooldown: ({ player }) => {
      return player.talents.includes(222) //Master of War
        ? 96 : 120;
    }
  }
};

export function getAbility(abilityId: number): Ability {
  const ability = ABILITIES[abilityId];
  if (!ability) {
    return {
      name: "Unknown ability " + abilityId,
      icon: "/assets/missing.png",
      getCooldown: () => 0
    };
  }
  return ability;
}

const DUNGEONS: Record<number, DungeonConfig> = {
  8: {
    name: 'Wyrmheart',
    worldBounds: {
      minX: -32815.506374,
      maxX: 49657.514725,
      minY: 8640.414103,
      maxY: 71315.020202
    },
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
  21: {
    name: 'Urrak Markets',
    worldBounds: {
      minX: -43288.488172,
      maxX: 44711.511828,
      minY: -19081.419530,
      maxY: 24918.580470
    },
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
  24: {
    name: 'Silken Hollow',
    worldBounds: {
      minX: -64228.321285,
      maxX: 49771.678715,
      minY: -15630.354306,
      maxY: 47891.221316
    },
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
  6: {
    name: 'Empyrean Sands',
    worldBounds: {
      minX: -40000.00,
      maxX: 40000.00,
      minY: -40000.00,
      maxY: 40000.00
    },
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
  }
};

export function getDungeonConfig(dungeonId: number): DungeonConfig | null {
  return DUNGEONS[dungeonId] || null;
}
