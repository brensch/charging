/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "contracts";

export enum StateMachineState {
  /**
   * StateMachineState_INITIALISING - StateMachineState_ON = 1;
   * StateMachineState_OFF = 2;
   * StateMachineState_USER_REQUESTED_ON = 3;
   * StateMachineState_USER_REQUESTED_OFF = 4;
   * StateMachineState_LOCAL_COMMAND_ISSUED_ON = 5;
   * StateMachineState_LOCAL_COMMAND_ISSUED_OFF = 6;
   */
  StateMachineState_INITIALISING = 0,
  StateMachineState_ACCOUNT_NULL = 7,
  StateMachineState_ACCOUNT_ADDED = 8,
  StateMachineState_ENTERING_QUEUE = 9,
  StateMachineState_IN_QUEUE = 10,
  StateMachineState_SENSING_START_REQUESTED = 11,
  StateMachineState_SENSING_START_ISSUED_LOCALLY = 12,
  /** StateMachineState_SENSING_CHARGE - StateMachineState_SENSING_START_ACKNOWLEDGED = 13; */
  StateMachineState_SENSING_CHARGE = 14,
  StateMachineState_CHARGING = 15,
  StateMachineState_CHARGE_COMPLETE = 16,
  StateMachineState_ACCOUNT_REMOVAL_REQUESTED = 17,
  StateMachineState_ACCOUNT_REMOVAL_ISSUED_LOCALLY = 18,
  StateMachineState_WAITING_FOR_PLUG_IN = 19,
  UNRECOGNIZED = -1,
}

export function stateMachineStateFromJSON(object: any): StateMachineState {
  switch (object) {
    case 0:
    case "StateMachineState_INITIALISING":
      return StateMachineState.StateMachineState_INITIALISING;
    case 7:
    case "StateMachineState_ACCOUNT_NULL":
      return StateMachineState.StateMachineState_ACCOUNT_NULL;
    case 8:
    case "StateMachineState_ACCOUNT_ADDED":
      return StateMachineState.StateMachineState_ACCOUNT_ADDED;
    case 9:
    case "StateMachineState_ENTERING_QUEUE":
      return StateMachineState.StateMachineState_ENTERING_QUEUE;
    case 10:
    case "StateMachineState_IN_QUEUE":
      return StateMachineState.StateMachineState_IN_QUEUE;
    case 11:
    case "StateMachineState_SENSING_START_REQUESTED":
      return StateMachineState.StateMachineState_SENSING_START_REQUESTED;
    case 12:
    case "StateMachineState_SENSING_START_ISSUED_LOCALLY":
      return StateMachineState.StateMachineState_SENSING_START_ISSUED_LOCALLY;
    case 14:
    case "StateMachineState_SENSING_CHARGE":
      return StateMachineState.StateMachineState_SENSING_CHARGE;
    case 15:
    case "StateMachineState_CHARGING":
      return StateMachineState.StateMachineState_CHARGING;
    case 16:
    case "StateMachineState_CHARGE_COMPLETE":
      return StateMachineState.StateMachineState_CHARGE_COMPLETE;
    case 17:
    case "StateMachineState_ACCOUNT_REMOVAL_REQUESTED":
      return StateMachineState.StateMachineState_ACCOUNT_REMOVAL_REQUESTED;
    case 18:
    case "StateMachineState_ACCOUNT_REMOVAL_ISSUED_LOCALLY":
      return StateMachineState.StateMachineState_ACCOUNT_REMOVAL_ISSUED_LOCALLY;
    case 19:
    case "StateMachineState_WAITING_FOR_PLUG_IN":
      return StateMachineState.StateMachineState_WAITING_FOR_PLUG_IN;
    case -1:
    case "UNRECOGNIZED":
    default:
      return StateMachineState.UNRECOGNIZED;
  }
}

export function stateMachineStateToJSON(object: StateMachineState): string {
  switch (object) {
    case StateMachineState.StateMachineState_INITIALISING:
      return "StateMachineState_INITIALISING";
    case StateMachineState.StateMachineState_ACCOUNT_NULL:
      return "StateMachineState_ACCOUNT_NULL";
    case StateMachineState.StateMachineState_ACCOUNT_ADDED:
      return "StateMachineState_ACCOUNT_ADDED";
    case StateMachineState.StateMachineState_ENTERING_QUEUE:
      return "StateMachineState_ENTERING_QUEUE";
    case StateMachineState.StateMachineState_IN_QUEUE:
      return "StateMachineState_IN_QUEUE";
    case StateMachineState.StateMachineState_SENSING_START_REQUESTED:
      return "StateMachineState_SENSING_START_REQUESTED";
    case StateMachineState.StateMachineState_SENSING_START_ISSUED_LOCALLY:
      return "StateMachineState_SENSING_START_ISSUED_LOCALLY";
    case StateMachineState.StateMachineState_SENSING_CHARGE:
      return "StateMachineState_SENSING_CHARGE";
    case StateMachineState.StateMachineState_CHARGING:
      return "StateMachineState_CHARGING";
    case StateMachineState.StateMachineState_CHARGE_COMPLETE:
      return "StateMachineState_CHARGE_COMPLETE";
    case StateMachineState.StateMachineState_ACCOUNT_REMOVAL_REQUESTED:
      return "StateMachineState_ACCOUNT_REMOVAL_REQUESTED";
    case StateMachineState.StateMachineState_ACCOUNT_REMOVAL_ISSUED_LOCALLY:
      return "StateMachineState_ACCOUNT_REMOVAL_ISSUED_LOCALLY";
    case StateMachineState.StateMachineState_WAITING_FOR_PLUG_IN:
      return "StateMachineState_WAITING_FOR_PLUG_IN";
    case StateMachineState.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum UserRequestStatus {
  RequestedStatus_UNKNOWN = 0,
  /** RequestedStatus_PENDING - need to write a fs rule to only allow this status from non backend */
  RequestedStatus_PENDING = 1,
  RequestedStatus_SUCCESS = 2,
  RequestedStatus_FAILURE = 3,
  /** RequestedStatus_RECEIVED - TODO: add more failure reason statuses */
  RequestedStatus_RECEIVED = 4,
  UNRECOGNIZED = -1,
}

export function userRequestStatusFromJSON(object: any): UserRequestStatus {
  switch (object) {
    case 0:
    case "RequestedStatus_UNKNOWN":
      return UserRequestStatus.RequestedStatus_UNKNOWN;
    case 1:
    case "RequestedStatus_PENDING":
      return UserRequestStatus.RequestedStatus_PENDING;
    case 2:
    case "RequestedStatus_SUCCESS":
      return UserRequestStatus.RequestedStatus_SUCCESS;
    case 3:
    case "RequestedStatus_FAILURE":
      return UserRequestStatus.RequestedStatus_FAILURE;
    case 4:
    case "RequestedStatus_RECEIVED":
      return UserRequestStatus.RequestedStatus_RECEIVED;
    case -1:
    case "UNRECOGNIZED":
    default:
      return UserRequestStatus.UNRECOGNIZED;
  }
}

export function userRequestStatusToJSON(object: UserRequestStatus): string {
  switch (object) {
    case UserRequestStatus.RequestedStatus_UNKNOWN:
      return "RequestedStatus_UNKNOWN";
    case UserRequestStatus.RequestedStatus_PENDING:
      return "RequestedStatus_PENDING";
    case UserRequestStatus.RequestedStatus_SUCCESS:
      return "RequestedStatus_SUCCESS";
    case UserRequestStatus.RequestedStatus_FAILURE:
      return "RequestedStatus_FAILURE";
    case UserRequestStatus.RequestedStatus_RECEIVED:
      return "RequestedStatus_RECEIVED";
    case UserRequestStatus.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum RequestedState {
  /** RequestedState_UNKNOWN - Default value, used as a placeholder */
  RequestedState_UNKNOWN = 0,
  /** RequestedState_ON - Relay is on */
  RequestedState_ON = 1,
  /** RequestedState_OFF - Relay is off */
  RequestedState_OFF = 2,
  UNRECOGNIZED = -1,
}

export function requestedStateFromJSON(object: any): RequestedState {
  switch (object) {
    case 0:
    case "RequestedState_UNKNOWN":
      return RequestedState.RequestedState_UNKNOWN;
    case 1:
    case "RequestedState_ON":
      return RequestedState.RequestedState_ON;
    case 2:
    case "RequestedState_OFF":
      return RequestedState.RequestedState_OFF;
    case -1:
    case "UNRECOGNIZED":
    default:
      return RequestedState.UNRECOGNIZED;
  }
}

export function requestedStateToJSON(object: RequestedState): string {
  switch (object) {
    case RequestedState.RequestedState_UNKNOWN:
      return "RequestedState_UNKNOWN";
    case RequestedState.RequestedState_ON:
      return "RequestedState_ON";
    case RequestedState.RequestedState_OFF:
      return "RequestedState_OFF";
    case RequestedState.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum RequestedStateReason {
  /** RequestedStateReason_UNKNOWN - Default value, used as a placeholder */
  RequestedStateReason_UNKNOWN = 0,
  RequestedStateReason_PRICE = 1,
  RequestedStateReason_USER = 2,
  RequestedStateReason_CREDIT = 3,
  UNRECOGNIZED = -1,
}

export function requestedStateReasonFromJSON(object: any): RequestedStateReason {
  switch (object) {
    case 0:
    case "RequestedStateReason_UNKNOWN":
      return RequestedStateReason.RequestedStateReason_UNKNOWN;
    case 1:
    case "RequestedStateReason_PRICE":
      return RequestedStateReason.RequestedStateReason_PRICE;
    case 2:
    case "RequestedStateReason_USER":
      return RequestedStateReason.RequestedStateReason_USER;
    case 3:
    case "RequestedStateReason_CREDIT":
      return RequestedStateReason.RequestedStateReason_CREDIT;
    case -1:
    case "UNRECOGNIZED":
    default:
      return RequestedStateReason.UNRECOGNIZED;
  }
}

export function requestedStateReasonToJSON(object: RequestedStateReason): string {
  switch (object) {
    case RequestedStateReason.RequestedStateReason_UNKNOWN:
      return "RequestedStateReason_UNKNOWN";
    case RequestedStateReason.RequestedStateReason_PRICE:
      return "RequestedStateReason_PRICE";
    case RequestedStateReason.RequestedStateReason_USER:
      return "RequestedStateReason_USER";
    case RequestedStateReason.RequestedStateReason_CREDIT:
      return "RequestedStateReason_CREDIT";
    case RequestedStateReason.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum FuzeState {
  /** FuzeState_UNKNOWN - Default value, used as a placeholder */
  FuzeState_UNKNOWN = 0,
  FuzeState_OK = 1,
  FuzeState_LIMITING = 2,
  UNRECOGNIZED = -1,
}

export function fuzeStateFromJSON(object: any): FuzeState {
  switch (object) {
    case 0:
    case "FuzeState_UNKNOWN":
      return FuzeState.FuzeState_UNKNOWN;
    case 1:
    case "FuzeState_OK":
      return FuzeState.FuzeState_OK;
    case 2:
    case "FuzeState_LIMITING":
      return FuzeState.FuzeState_LIMITING;
    case -1:
    case "UNRECOGNIZED":
    default:
      return FuzeState.UNRECOGNIZED;
  }
}

export function fuzeStateToJSON(object: FuzeState): string {
  switch (object) {
    case FuzeState.FuzeState_UNKNOWN:
      return "FuzeState_UNKNOWN";
    case FuzeState.FuzeState_OK:
      return "FuzeState_OK";
    case FuzeState.FuzeState_LIMITING:
      return "FuzeState_LIMITING";
    case FuzeState.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum ActualState {
  /** ActualState_UNKNOWN - Default value, used as a placeholder */
  ActualState_UNKNOWN = 0,
  /** ActualState_ON - Relay is on */
  ActualState_ON = 1,
  /** ActualState_OFF - Relay is off */
  ActualState_OFF = 2,
  /** ActualState_MIA - Not available or missing */
  ActualState_MIA = 3,
  /** ActualState_OVERCURRENT - Overcurrent detected */
  ActualState_OVERCURRENT = 4,
  UNRECOGNIZED = -1,
}

export function actualStateFromJSON(object: any): ActualState {
  switch (object) {
    case 0:
    case "ActualState_UNKNOWN":
      return ActualState.ActualState_UNKNOWN;
    case 1:
    case "ActualState_ON":
      return ActualState.ActualState_ON;
    case 2:
    case "ActualState_OFF":
      return ActualState.ActualState_OFF;
    case 3:
    case "ActualState_MIA":
      return ActualState.ActualState_MIA;
    case 4:
    case "ActualState_OVERCURRENT":
      return ActualState.ActualState_OVERCURRENT;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ActualState.UNRECOGNIZED;
  }
}

export function actualStateToJSON(object: ActualState): string {
  switch (object) {
    case ActualState.ActualState_UNKNOWN:
      return "ActualState_UNKNOWN";
    case ActualState.ActualState_ON:
      return "ActualState_ON";
    case ActualState.ActualState_OFF:
      return "ActualState_OFF";
    case ActualState.ActualState_MIA:
      return "ActualState_MIA";
    case ActualState.ActualState_OVERCURRENT:
      return "ActualState_OVERCURRENT";
    case ActualState.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/**
 * FuzeGroup represents a collection of plugs that need to obey an electrical
 * limit, ie all four plugs in a shelly 4pro.
 */
export interface FuzeSettings {
  id: string;
  name: string;
  current_limit: number;
  site_id: string;
}

export interface StateMachineTransition {
  id: string;
  state: StateMachineState;
  reason: string;
  time_ms: number;
  plug_id: string;
  owner_id: string;
}

export interface StateMachinePossibleNextStates {
  plug_id: string;
  possible_states: StateMachineState[];
}

/** plug settings are all the things the user can update in the UI */
export interface PlugSettings {
  id: string;
  name: string;
  current_limit: number;
  site_id: string;
  /**
   * used to decide whether to update latest_reading in the plugstatus.
   * if a user has checked recently, update, otherwise, do not write readings
   * value.
   */
  last_time_user_checking_ms: number;
}

export interface LocalStateRequest {
  id: string;
  plug_id: string;
  site_id: string;
  requested_state: RequestedState;
  request_time: number;
}

export interface LocalStateResponse {
  req_id: string;
  resultant_state: RequestedState;
  plug_id: string;
  site_id: string;
  time: number;
}

/** this gets written by the frontend and never edited */
export interface UserRequest {
  id: string;
  user_id: string;
  plug_id: string;
  requested_state: StateMachineState;
  time_requested: number;
  result: UserRequestResult | undefined;
}

/** this can only be written by the backend and shows the result of a request */
export interface UserRequestResult {
  time_entered_state: number;
  status: UserRequestStatus;
  reason: string;
}

/**
 * this is what is used by the frontend to visualise what's going on.
 * it should only be updateable by the mothership
 * it's also used on startup of the mothership to hydrate its statemachinemap
 */
export interface PlugStatus {
  id: string;
  site_id: string;
  state: StateMachineTransition | undefined;
  latest_reading: Reading | undefined;
}

export interface Reading {
  /** Indicates if the relay is currently on, off, MIA, etc. */
  state: ActualState;
  /** The current power reading in watts */
  current: number;
  /** The voltage reading in volts */
  voltage: number;
  /** Power factor, typically a value between -1 and 1 */
  power_factor: number;
  /** Timestamp of the reading in ms since epoch */
  timestamp_ms: number;
  plug_id: string;
  fuze_id: string;
}

export interface ReadingChunk {
  site_id: string;
  readings: Reading[];
}

export interface SiteSettings {
  id: string;
  name: string;
  description: string;
}

export interface DeviceAnnouncement {
  site_id: string;
  plug_ids: string[];
  fuze_ids: string[];
}

function createBaseFuzeSettings(): FuzeSettings {
  return { id: "", name: "", current_limit: 0, site_id: "" };
}

export const FuzeSettings = {
  encode(message: FuzeSettings, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.current_limit !== 0) {
      writer.uint32(25).double(message.current_limit);
    }
    if (message.site_id !== "") {
      writer.uint32(34).string(message.site_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FuzeSettings {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFuzeSettings();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.current_limit = reader.double();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.site_id = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FuzeSettings {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      current_limit: isSet(object.current_limit) ? globalThis.Number(object.current_limit) : 0,
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
    };
  },

  toJSON(message: FuzeSettings): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.current_limit !== 0) {
      obj.current_limit = message.current_limit;
    }
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<FuzeSettings>, I>>(base?: I): FuzeSettings {
    return FuzeSettings.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<FuzeSettings>, I>>(object: I): FuzeSettings {
    const message = createBaseFuzeSettings();
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.current_limit = object.current_limit ?? 0;
    message.site_id = object.site_id ?? "";
    return message;
  },
};

function createBaseStateMachineTransition(): StateMachineTransition {
  return { id: "", state: 0, reason: "", time_ms: 0, plug_id: "", owner_id: "" };
}

export const StateMachineTransition = {
  encode(message: StateMachineTransition, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.state !== 0) {
      writer.uint32(16).int32(message.state);
    }
    if (message.reason !== "") {
      writer.uint32(26).string(message.reason);
    }
    if (message.time_ms !== 0) {
      writer.uint32(32).int64(message.time_ms);
    }
    if (message.plug_id !== "") {
      writer.uint32(42).string(message.plug_id);
    }
    if (message.owner_id !== "") {
      writer.uint32(50).string(message.owner_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StateMachineTransition {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStateMachineTransition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.state = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.reason = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.time_ms = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.plug_id = reader.string();
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.owner_id = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StateMachineTransition {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      state: isSet(object.state) ? stateMachineStateFromJSON(object.state) : 0,
      reason: isSet(object.reason) ? globalThis.String(object.reason) : "",
      time_ms: isSet(object.time_ms) ? globalThis.Number(object.time_ms) : 0,
      plug_id: isSet(object.plug_id) ? globalThis.String(object.plug_id) : "",
      owner_id: isSet(object.owner_id) ? globalThis.String(object.owner_id) : "",
    };
  },

  toJSON(message: StateMachineTransition): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.state !== 0) {
      obj.state = stateMachineStateToJSON(message.state);
    }
    if (message.reason !== "") {
      obj.reason = message.reason;
    }
    if (message.time_ms !== 0) {
      obj.time_ms = Math.round(message.time_ms);
    }
    if (message.plug_id !== "") {
      obj.plug_id = message.plug_id;
    }
    if (message.owner_id !== "") {
      obj.owner_id = message.owner_id;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<StateMachineTransition>, I>>(base?: I): StateMachineTransition {
    return StateMachineTransition.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<StateMachineTransition>, I>>(object: I): StateMachineTransition {
    const message = createBaseStateMachineTransition();
    message.id = object.id ?? "";
    message.state = object.state ?? 0;
    message.reason = object.reason ?? "";
    message.time_ms = object.time_ms ?? 0;
    message.plug_id = object.plug_id ?? "";
    message.owner_id = object.owner_id ?? "";
    return message;
  },
};

function createBaseStateMachinePossibleNextStates(): StateMachinePossibleNextStates {
  return { plug_id: "", possible_states: [] };
}

export const StateMachinePossibleNextStates = {
  encode(message: StateMachinePossibleNextStates, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plug_id !== "") {
      writer.uint32(10).string(message.plug_id);
    }
    writer.uint32(18).fork();
    for (const v of message.possible_states) {
      writer.int32(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StateMachinePossibleNextStates {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStateMachinePossibleNextStates();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.plug_id = reader.string();
          continue;
        case 2:
          if (tag === 16) {
            message.possible_states.push(reader.int32() as any);

            continue;
          }

          if (tag === 18) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.possible_states.push(reader.int32() as any);
            }

            continue;
          }

          break;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StateMachinePossibleNextStates {
    return {
      plug_id: isSet(object.plug_id) ? globalThis.String(object.plug_id) : "",
      possible_states: globalThis.Array.isArray(object?.possible_states)
        ? object.possible_states.map((e: any) => stateMachineStateFromJSON(e))
        : [],
    };
  },

  toJSON(message: StateMachinePossibleNextStates): unknown {
    const obj: any = {};
    if (message.plug_id !== "") {
      obj.plug_id = message.plug_id;
    }
    if (message.possible_states?.length) {
      obj.possible_states = message.possible_states.map((e) => stateMachineStateToJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<StateMachinePossibleNextStates>, I>>(base?: I): StateMachinePossibleNextStates {
    return StateMachinePossibleNextStates.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<StateMachinePossibleNextStates>, I>>(
    object: I,
  ): StateMachinePossibleNextStates {
    const message = createBaseStateMachinePossibleNextStates();
    message.plug_id = object.plug_id ?? "";
    message.possible_states = object.possible_states?.map((e) => e) || [];
    return message;
  },
};

function createBasePlugSettings(): PlugSettings {
  return { id: "", name: "", current_limit: 0, site_id: "", last_time_user_checking_ms: 0 };
}

export const PlugSettings = {
  encode(message: PlugSettings, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.current_limit !== 0) {
      writer.uint32(25).double(message.current_limit);
    }
    if (message.site_id !== "") {
      writer.uint32(34).string(message.site_id);
    }
    if (message.last_time_user_checking_ms !== 0) {
      writer.uint32(40).int64(message.last_time_user_checking_ms);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlugSettings {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlugSettings();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.current_limit = reader.double();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.site_id = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.last_time_user_checking_ms = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PlugSettings {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      current_limit: isSet(object.current_limit) ? globalThis.Number(object.current_limit) : 0,
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      last_time_user_checking_ms: isSet(object.last_time_user_checking_ms)
        ? globalThis.Number(object.last_time_user_checking_ms)
        : 0,
    };
  },

  toJSON(message: PlugSettings): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.current_limit !== 0) {
      obj.current_limit = message.current_limit;
    }
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    if (message.last_time_user_checking_ms !== 0) {
      obj.last_time_user_checking_ms = Math.round(message.last_time_user_checking_ms);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PlugSettings>, I>>(base?: I): PlugSettings {
    return PlugSettings.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<PlugSettings>, I>>(object: I): PlugSettings {
    const message = createBasePlugSettings();
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.current_limit = object.current_limit ?? 0;
    message.site_id = object.site_id ?? "";
    message.last_time_user_checking_ms = object.last_time_user_checking_ms ?? 0;
    return message;
  },
};

function createBaseLocalStateRequest(): LocalStateRequest {
  return { id: "", plug_id: "", site_id: "", requested_state: 0, request_time: 0 };
}

export const LocalStateRequest = {
  encode(message: LocalStateRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.plug_id !== "") {
      writer.uint32(18).string(message.plug_id);
    }
    if (message.site_id !== "") {
      writer.uint32(26).string(message.site_id);
    }
    if (message.requested_state !== 0) {
      writer.uint32(32).int32(message.requested_state);
    }
    if (message.request_time !== 0) {
      writer.uint32(40).int64(message.request_time);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LocalStateRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLocalStateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.plug_id = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.site_id = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.requested_state = reader.int32() as any;
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.request_time = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): LocalStateRequest {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      plug_id: isSet(object.plug_id) ? globalThis.String(object.plug_id) : "",
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      requested_state: isSet(object.requested_state) ? requestedStateFromJSON(object.requested_state) : 0,
      request_time: isSet(object.request_time) ? globalThis.Number(object.request_time) : 0,
    };
  },

  toJSON(message: LocalStateRequest): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.plug_id !== "") {
      obj.plug_id = message.plug_id;
    }
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    if (message.requested_state !== 0) {
      obj.requested_state = requestedStateToJSON(message.requested_state);
    }
    if (message.request_time !== 0) {
      obj.request_time = Math.round(message.request_time);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<LocalStateRequest>, I>>(base?: I): LocalStateRequest {
    return LocalStateRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<LocalStateRequest>, I>>(object: I): LocalStateRequest {
    const message = createBaseLocalStateRequest();
    message.id = object.id ?? "";
    message.plug_id = object.plug_id ?? "";
    message.site_id = object.site_id ?? "";
    message.requested_state = object.requested_state ?? 0;
    message.request_time = object.request_time ?? 0;
    return message;
  },
};

function createBaseLocalStateResponse(): LocalStateResponse {
  return { req_id: "", resultant_state: 0, plug_id: "", site_id: "", time: 0 };
}

export const LocalStateResponse = {
  encode(message: LocalStateResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.req_id !== "") {
      writer.uint32(10).string(message.req_id);
    }
    if (message.resultant_state !== 0) {
      writer.uint32(16).int32(message.resultant_state);
    }
    if (message.plug_id !== "") {
      writer.uint32(26).string(message.plug_id);
    }
    if (message.site_id !== "") {
      writer.uint32(34).string(message.site_id);
    }
    if (message.time !== 0) {
      writer.uint32(40).int64(message.time);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LocalStateResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLocalStateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.req_id = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.resultant_state = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.plug_id = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.site_id = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.time = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): LocalStateResponse {
    return {
      req_id: isSet(object.req_id) ? globalThis.String(object.req_id) : "",
      resultant_state: isSet(object.resultant_state) ? requestedStateFromJSON(object.resultant_state) : 0,
      plug_id: isSet(object.plug_id) ? globalThis.String(object.plug_id) : "",
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      time: isSet(object.time) ? globalThis.Number(object.time) : 0,
    };
  },

  toJSON(message: LocalStateResponse): unknown {
    const obj: any = {};
    if (message.req_id !== "") {
      obj.req_id = message.req_id;
    }
    if (message.resultant_state !== 0) {
      obj.resultant_state = requestedStateToJSON(message.resultant_state);
    }
    if (message.plug_id !== "") {
      obj.plug_id = message.plug_id;
    }
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    if (message.time !== 0) {
      obj.time = Math.round(message.time);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<LocalStateResponse>, I>>(base?: I): LocalStateResponse {
    return LocalStateResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<LocalStateResponse>, I>>(object: I): LocalStateResponse {
    const message = createBaseLocalStateResponse();
    message.req_id = object.req_id ?? "";
    message.resultant_state = object.resultant_state ?? 0;
    message.plug_id = object.plug_id ?? "";
    message.site_id = object.site_id ?? "";
    message.time = object.time ?? 0;
    return message;
  },
};

function createBaseUserRequest(): UserRequest {
  return { id: "", user_id: "", plug_id: "", requested_state: 0, time_requested: 0, result: undefined };
}

export const UserRequest = {
  encode(message: UserRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.user_id !== "") {
      writer.uint32(18).string(message.user_id);
    }
    if (message.plug_id !== "") {
      writer.uint32(26).string(message.plug_id);
    }
    if (message.requested_state !== 0) {
      writer.uint32(32).int32(message.requested_state);
    }
    if (message.time_requested !== 0) {
      writer.uint32(40).int64(message.time_requested);
    }
    if (message.result !== undefined) {
      UserRequestResult.encode(message.result, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.user_id = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.plug_id = reader.string();
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.requested_state = reader.int32() as any;
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.time_requested = longToNumber(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.result = UserRequestResult.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UserRequest {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      user_id: isSet(object.user_id) ? globalThis.String(object.user_id) : "",
      plug_id: isSet(object.plug_id) ? globalThis.String(object.plug_id) : "",
      requested_state: isSet(object.requested_state) ? stateMachineStateFromJSON(object.requested_state) : 0,
      time_requested: isSet(object.time_requested) ? globalThis.Number(object.time_requested) : 0,
      result: isSet(object.result) ? UserRequestResult.fromJSON(object.result) : undefined,
    };
  },

  toJSON(message: UserRequest): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.user_id !== "") {
      obj.user_id = message.user_id;
    }
    if (message.plug_id !== "") {
      obj.plug_id = message.plug_id;
    }
    if (message.requested_state !== 0) {
      obj.requested_state = stateMachineStateToJSON(message.requested_state);
    }
    if (message.time_requested !== 0) {
      obj.time_requested = Math.round(message.time_requested);
    }
    if (message.result !== undefined) {
      obj.result = UserRequestResult.toJSON(message.result);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UserRequest>, I>>(base?: I): UserRequest {
    return UserRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UserRequest>, I>>(object: I): UserRequest {
    const message = createBaseUserRequest();
    message.id = object.id ?? "";
    message.user_id = object.user_id ?? "";
    message.plug_id = object.plug_id ?? "";
    message.requested_state = object.requested_state ?? 0;
    message.time_requested = object.time_requested ?? 0;
    message.result = (object.result !== undefined && object.result !== null)
      ? UserRequestResult.fromPartial(object.result)
      : undefined;
    return message;
  },
};

function createBaseUserRequestResult(): UserRequestResult {
  return { time_entered_state: 0, status: 0, reason: "" };
}

export const UserRequestResult = {
  encode(message: UserRequestResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.time_entered_state !== 0) {
      writer.uint32(8).int64(message.time_entered_state);
    }
    if (message.status !== 0) {
      writer.uint32(16).int32(message.status);
    }
    if (message.reason !== "") {
      writer.uint32(26).string(message.reason);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UserRequestResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserRequestResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.time_entered_state = longToNumber(reader.int64() as Long);
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.status = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.reason = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UserRequestResult {
    return {
      time_entered_state: isSet(object.time_entered_state) ? globalThis.Number(object.time_entered_state) : 0,
      status: isSet(object.status) ? userRequestStatusFromJSON(object.status) : 0,
      reason: isSet(object.reason) ? globalThis.String(object.reason) : "",
    };
  },

  toJSON(message: UserRequestResult): unknown {
    const obj: any = {};
    if (message.time_entered_state !== 0) {
      obj.time_entered_state = Math.round(message.time_entered_state);
    }
    if (message.status !== 0) {
      obj.status = userRequestStatusToJSON(message.status);
    }
    if (message.reason !== "") {
      obj.reason = message.reason;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UserRequestResult>, I>>(base?: I): UserRequestResult {
    return UserRequestResult.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UserRequestResult>, I>>(object: I): UserRequestResult {
    const message = createBaseUserRequestResult();
    message.time_entered_state = object.time_entered_state ?? 0;
    message.status = object.status ?? 0;
    message.reason = object.reason ?? "";
    return message;
  },
};

function createBasePlugStatus(): PlugStatus {
  return { id: "", site_id: "", state: undefined, latest_reading: undefined };
}

export const PlugStatus = {
  encode(message: PlugStatus, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.site_id !== "") {
      writer.uint32(18).string(message.site_id);
    }
    if (message.state !== undefined) {
      StateMachineTransition.encode(message.state, writer.uint32(26).fork()).ldelim();
    }
    if (message.latest_reading !== undefined) {
      Reading.encode(message.latest_reading, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlugStatus {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlugStatus();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.site_id = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.state = StateMachineTransition.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.latest_reading = Reading.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PlugStatus {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      state: isSet(object.state) ? StateMachineTransition.fromJSON(object.state) : undefined,
      latest_reading: isSet(object.latest_reading) ? Reading.fromJSON(object.latest_reading) : undefined,
    };
  },

  toJSON(message: PlugStatus): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    if (message.state !== undefined) {
      obj.state = StateMachineTransition.toJSON(message.state);
    }
    if (message.latest_reading !== undefined) {
      obj.latest_reading = Reading.toJSON(message.latest_reading);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PlugStatus>, I>>(base?: I): PlugStatus {
    return PlugStatus.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<PlugStatus>, I>>(object: I): PlugStatus {
    const message = createBasePlugStatus();
    message.id = object.id ?? "";
    message.site_id = object.site_id ?? "";
    message.state = (object.state !== undefined && object.state !== null)
      ? StateMachineTransition.fromPartial(object.state)
      : undefined;
    message.latest_reading = (object.latest_reading !== undefined && object.latest_reading !== null)
      ? Reading.fromPartial(object.latest_reading)
      : undefined;
    return message;
  },
};

function createBaseReading(): Reading {
  return { state: 0, current: 0, voltage: 0, power_factor: 0, timestamp_ms: 0, plug_id: "", fuze_id: "" };
}

export const Reading = {
  encode(message: Reading, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.state !== 0) {
      writer.uint32(8).int32(message.state);
    }
    if (message.current !== 0) {
      writer.uint32(17).double(message.current);
    }
    if (message.voltage !== 0) {
      writer.uint32(25).double(message.voltage);
    }
    if (message.power_factor !== 0) {
      writer.uint32(33).double(message.power_factor);
    }
    if (message.timestamp_ms !== 0) {
      writer.uint32(40).int64(message.timestamp_ms);
    }
    if (message.plug_id !== "") {
      writer.uint32(50).string(message.plug_id);
    }
    if (message.fuze_id !== "") {
      writer.uint32(58).string(message.fuze_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Reading {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseReading();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.state = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 17) {
            break;
          }

          message.current = reader.double();
          continue;
        case 3:
          if (tag !== 25) {
            break;
          }

          message.voltage = reader.double();
          continue;
        case 4:
          if (tag !== 33) {
            break;
          }

          message.power_factor = reader.double();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.timestamp_ms = longToNumber(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.plug_id = reader.string();
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.fuze_id = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Reading {
    return {
      state: isSet(object.state) ? actualStateFromJSON(object.state) : 0,
      current: isSet(object.current) ? globalThis.Number(object.current) : 0,
      voltage: isSet(object.voltage) ? globalThis.Number(object.voltage) : 0,
      power_factor: isSet(object.power_factor) ? globalThis.Number(object.power_factor) : 0,
      timestamp_ms: isSet(object.timestamp_ms) ? globalThis.Number(object.timestamp_ms) : 0,
      plug_id: isSet(object.plug_id) ? globalThis.String(object.plug_id) : "",
      fuze_id: isSet(object.fuze_id) ? globalThis.String(object.fuze_id) : "",
    };
  },

  toJSON(message: Reading): unknown {
    const obj: any = {};
    if (message.state !== 0) {
      obj.state = actualStateToJSON(message.state);
    }
    if (message.current !== 0) {
      obj.current = message.current;
    }
    if (message.voltage !== 0) {
      obj.voltage = message.voltage;
    }
    if (message.power_factor !== 0) {
      obj.power_factor = message.power_factor;
    }
    if (message.timestamp_ms !== 0) {
      obj.timestamp_ms = Math.round(message.timestamp_ms);
    }
    if (message.plug_id !== "") {
      obj.plug_id = message.plug_id;
    }
    if (message.fuze_id !== "") {
      obj.fuze_id = message.fuze_id;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Reading>, I>>(base?: I): Reading {
    return Reading.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Reading>, I>>(object: I): Reading {
    const message = createBaseReading();
    message.state = object.state ?? 0;
    message.current = object.current ?? 0;
    message.voltage = object.voltage ?? 0;
    message.power_factor = object.power_factor ?? 0;
    message.timestamp_ms = object.timestamp_ms ?? 0;
    message.plug_id = object.plug_id ?? "";
    message.fuze_id = object.fuze_id ?? "";
    return message;
  },
};

function createBaseReadingChunk(): ReadingChunk {
  return { site_id: "", readings: [] };
}

export const ReadingChunk = {
  encode(message: ReadingChunk, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.site_id !== "") {
      writer.uint32(10).string(message.site_id);
    }
    for (const v of message.readings) {
      Reading.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ReadingChunk {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseReadingChunk();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.site_id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.readings.push(Reading.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ReadingChunk {
    return {
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      readings: globalThis.Array.isArray(object?.readings) ? object.readings.map((e: any) => Reading.fromJSON(e)) : [],
    };
  },

  toJSON(message: ReadingChunk): unknown {
    const obj: any = {};
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    if (message.readings?.length) {
      obj.readings = message.readings.map((e) => Reading.toJSON(e));
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ReadingChunk>, I>>(base?: I): ReadingChunk {
    return ReadingChunk.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<ReadingChunk>, I>>(object: I): ReadingChunk {
    const message = createBaseReadingChunk();
    message.site_id = object.site_id ?? "";
    message.readings = object.readings?.map((e) => Reading.fromPartial(e)) || [];
    return message;
  },
};

function createBaseSiteSettings(): SiteSettings {
  return { id: "", name: "", description: "" };
}

export const SiteSettings = {
  encode(message: SiteSettings, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SiteSettings {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSiteSettings();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.name = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.description = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SiteSettings {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      description: isSet(object.description) ? globalThis.String(object.description) : "",
    };
  },

  toJSON(message: SiteSettings): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.description !== "") {
      obj.description = message.description;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<SiteSettings>, I>>(base?: I): SiteSettings {
    return SiteSettings.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<SiteSettings>, I>>(object: I): SiteSettings {
    const message = createBaseSiteSettings();
    message.id = object.id ?? "";
    message.name = object.name ?? "";
    message.description = object.description ?? "";
    return message;
  },
};

function createBaseDeviceAnnouncement(): DeviceAnnouncement {
  return { site_id: "", plug_ids: [], fuze_ids: [] };
}

export const DeviceAnnouncement = {
  encode(message: DeviceAnnouncement, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.site_id !== "") {
      writer.uint32(10).string(message.site_id);
    }
    for (const v of message.plug_ids) {
      writer.uint32(18).string(v!);
    }
    for (const v of message.fuze_ids) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DeviceAnnouncement {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDeviceAnnouncement();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.site_id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.plug_ids.push(reader.string());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.fuze_ids.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): DeviceAnnouncement {
    return {
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      plug_ids: globalThis.Array.isArray(object?.plug_ids) ? object.plug_ids.map((e: any) => globalThis.String(e)) : [],
      fuze_ids: globalThis.Array.isArray(object?.fuze_ids) ? object.fuze_ids.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: DeviceAnnouncement): unknown {
    const obj: any = {};
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    if (message.plug_ids?.length) {
      obj.plug_ids = message.plug_ids;
    }
    if (message.fuze_ids?.length) {
      obj.fuze_ids = message.fuze_ids;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<DeviceAnnouncement>, I>>(base?: I): DeviceAnnouncement {
    return DeviceAnnouncement.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<DeviceAnnouncement>, I>>(object: I): DeviceAnnouncement {
    const message = createBaseDeviceAnnouncement();
    message.site_id = object.site_id ?? "";
    message.plug_ids = object.plug_ids?.map((e) => e) || [];
    message.fuze_ids = object.fuze_ids?.map((e) => e) || [];
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function longToNumber(long: Long): number {
  if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
  }
  return long.toNumber();
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
