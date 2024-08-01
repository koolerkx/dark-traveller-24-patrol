const ATTACK_POWER: Record<string, number> = {
  _: 1 / 60,
  "1": 1 / 60,
  "2": 5 / 60,
  "3": 10 / 60,
  "4": 30 / 60,
  "5": 50 / 60,
};

const BOSS_HP_120 = 12500;
const BOSS_HP_180 = 25500;

const BOSS_HP = BOSS_HP_120;

export { ATTACK_POWER, BOSS_HP };
