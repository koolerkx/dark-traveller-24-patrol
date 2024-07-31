import { ATTACK_POWER } from "../constant";
import { CapturedPoint } from "../repository/point";

export const getAttackPower = (capturedPoint: CapturedPoint[]): number =>
  capturedPoint
    .filter((it) => !it.expiredAt)
    .reduce(
      (acc, cur) => acc + cur.level * ATTACK_POWER[cur.level.toString()],
      0
    );
