import { CapturedPoint } from "../repository/point";
import { User } from "../repository/user";

export type ACTIVITY_LOG_TYPE =
  | "CLEAR_POINT"
  | "CAPTURE_POINT"
  | "USER_UPGRADE"
  | "PATROL_CLEAR_POINT";

export interface UserUpgradeActivityLog {
  type: "USER_UPGRADE";
  datetime: string;
  user: User;
  point: string;
}

export interface ClearPointActivityLog {
  type: "CLEAR_POINT";
  datetime: string;
  user: User;
  point: CapturedPoint;
}

export interface CapturePointActivityLog {
  type: "CAPTURE_POINT";
  datetime: string;
  user: User;
  point: CapturedPoint;
}

export interface PatrolClearPointActivityLog {
  type: "PATROL_CLEAR_POINT";
  datetime: string;
  point: CapturedPoint;
}

export type ActivityLog =
  | UserUpgradeActivityLog
  | ClearPointActivityLog
  | CapturePointActivityLog
  | PatrolClearPointActivityLog;
