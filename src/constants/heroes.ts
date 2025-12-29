import type { Hero, Ability, Buff } from '../types';

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

const ABILITIES: Record<number, Ability> = {
  1465: {
    name: 'Grand Melee',
    icon: '/assets/abilities/grand_melee.jpg',
    getCooldown: ({ player }) => {
      return 120 *
        (player.talents.includes(222) ? 0.8 : 1.0)//Master of War
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

const BUFFS: Record<number, Buff> = {
  1282: {
    name: 'Shields Up',
    icon: '/assets/abilities/shields_up.jpg'
  }
};

export function getBuff(buffId: number): Buff {
  const buff = BUFFS[buffId];
  if (!buff) {
    return {
      name: "Unknown buff " + buffId,
      icon: "/assets/missing.png"
    };
  }
  return buff;
}
