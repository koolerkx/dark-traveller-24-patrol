import { differenceInSeconds } from "date-fns";
import { ATTACK_POWER, BOSS_HP } from "../constant";
import { CapturedPoint } from "../repository/point";

export interface BossInfo {
  hp: {
    total: number;
    remain: number;
  };
  attackedPower: number;
}

export const getBossInfo = (capturedPoints: CapturedPoint[]): BossInfo => {
  const now = new Date();

  const totalAttacked = capturedPoints
    .map((it) => ({
      ...it,
      duration: it.expiredAt
        ? differenceInSeconds(it.expiredAt, it.createdAt)
        : differenceInSeconds(now, it.createdAt),
      attackPower: ATTACK_POWER[it.level.toString()],
    }))
    .reduce((acc, cur) => cur.duration * cur.attackPower + acc, 0);

  return {
    hp: {
      total: BOSS_HP,
      remain: BOSS_HP - totalAttacked,
    },
    attackedPower: totalAttacked,
  };
};
