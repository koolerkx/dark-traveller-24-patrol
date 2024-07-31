import {
  CAPTURED_POINT_COOLDOWN_SECONDS,
  USER_MAXIMUM_LEVEL,
} from "./repository/user";

export class CapturedPointInCooldownError extends Error {
  public secondsSincecaptured: number;

  constructor(secondsSincecaptured: number) {
    super(
      `Point in cooldown: ${secondsSincecaptured}s/${CAPTURED_POINT_COOLDOWN_SECONDS}s`
    );
    this.secondsSincecaptured = secondsSincecaptured;
    this.name = "CapturedPointInCooldownError";
  }
}

export class ClearedPointNotCapturedError extends Error {
  constructor() {
    super();
    this.name = "ClearedPointNotCapturedError";
  }
}

export class ClearedPointNotFoundError extends Error {
  constructor() {
    super();
    this.name = "ClearedPointNotFoundError";
  }
}

export class CapturedPointAlreadyCapturedError extends Error {
  public pointId: string;

  constructor(pointId: string) {
    super(`Point already captured: ${pointId}`);
    this.pointId = pointId;
    this.name = "CapturedPointAlreadyCapturedError";
  }
}

export class MaximumLevelAchievedError extends Error {
  public level: number;

  constructor(level: number) {
    super(`Maximum level achieved: ${level}/${USER_MAXIMUM_LEVEL}`);
    this.level = level;
    this.name = "MaximumLevelAchievedError";
  }
}

export class UpgradePointAlreadyAppliedError extends Error {
  public upgradePointId: string;

  constructor(upgradePointId: string) {
    super(`Upgrade already applied: ${upgradePointId}`);
    this.upgradePointId = upgradePointId;
    this.name = "UpgradePointAlreadyAppliedError";
  }
}
