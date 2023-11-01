/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "contracts";

export enum SiteState {
  /** SiteState_UNKNOWN - Default value, used as a placeholder */
  SiteState_UNKNOWN = 0,
  /** SiteState_ONLINE - Relay is on */
  SiteState_ONLINE = 1,
  /** SiteState_OFFLINE - Relay is off */
  SiteState_OFFLINE = 2,
  /** SiteState_ERROR - Not available or missing */
  SiteState_ERROR = 3,
  UNRECOGNIZED = -1,
}

export function siteStateFromJSON(object: any): SiteState {
  switch (object) {
    case 0:
    case "SiteState_UNKNOWN":
      return SiteState.SiteState_UNKNOWN;
    case 1:
    case "SiteState_ONLINE":
      return SiteState.SiteState_ONLINE;
    case 2:
    case "SiteState_OFFLINE":
      return SiteState.SiteState_OFFLINE;
    case 3:
    case "SiteState_ERROR":
      return SiteState.SiteState_ERROR;
    case -1:
    case "UNRECOGNIZED":
    default:
      return SiteState.UNRECOGNIZED;
  }
}

export function siteStateToJSON(object: SiteState): string {
  switch (object) {
    case SiteState.SiteState_UNKNOWN:
      return "SiteState_UNKNOWN";
    case SiteState.SiteState_ONLINE:
      return "SiteState_ONLINE";
    case SiteState.SiteState_OFFLINE:
      return "SiteState_OFFLINE";
    case SiteState.SiteState_ERROR:
      return "SiteState_ERROR";
    case SiteState.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum PlugState {
  /** PlugState_UNKNOWN - Default value, used as a placeholder */
  PlugState_UNKNOWN = 0,
  /** PlugState_ON - Relay is on */
  PlugState_ON = 1,
  /** PlugState_OFF - Relay is off */
  PlugState_OFF = 2,
  /** PlugState_MIA - Not available or missing */
  PlugState_MIA = 3,
  /** PlugState_OVERCURRENT - Overcurrent detected */
  PlugState_OVERCURRENT = 4,
  UNRECOGNIZED = -1,
}

export function plugStateFromJSON(object: any): PlugState {
  switch (object) {
    case 0:
    case "PlugState_UNKNOWN":
      return PlugState.PlugState_UNKNOWN;
    case 1:
    case "PlugState_ON":
      return PlugState.PlugState_ON;
    case 2:
    case "PlugState_OFF":
      return PlugState.PlugState_OFF;
    case 3:
    case "PlugState_MIA":
      return PlugState.PlugState_MIA;
    case 4:
    case "PlugState_OVERCURRENT":
      return PlugState.PlugState_OVERCURRENT;
    case -1:
    case "UNRECOGNIZED":
    default:
      return PlugState.UNRECOGNIZED;
  }
}

export function plugStateToJSON(object: PlugState): string {
  switch (object) {
    case PlugState.PlugState_UNKNOWN:
      return "PlugState_UNKNOWN";
    case PlugState.PlugState_ON:
      return "PlugState_ON";
    case PlugState.PlugState_OFF:
      return "PlugState_OFF";
    case PlugState.PlugState_MIA:
      return "PlugState_MIA";
    case PlugState.PlugState_OVERCURRENT:
      return "PlugState_OVERCURRENT";
    case PlugState.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum PlugStateRequest {
  /** PlugStateRequest_UNKNOWN - Default value, used as a placeholder */
  PlugStateRequest_UNKNOWN = 0,
  /** PlugStateRequest_ON - Relay is on */
  PlugStateRequest_ON = 1,
  /** PlugStateRequest_OFF - Relay is off */
  PlugStateRequest_OFF = 2,
  UNRECOGNIZED = -1,
}

export function plugStateRequestFromJSON(object: any): PlugStateRequest {
  switch (object) {
    case 0:
    case "PlugStateRequest_UNKNOWN":
      return PlugStateRequest.PlugStateRequest_UNKNOWN;
    case 1:
    case "PlugStateRequest_ON":
      return PlugStateRequest.PlugStateRequest_ON;
    case 2:
    case "PlugStateRequest_OFF":
      return PlugStateRequest.PlugStateRequest_OFF;
    case -1:
    case "UNRECOGNIZED":
    default:
      return PlugStateRequest.UNRECOGNIZED;
  }
}

export function plugStateRequestToJSON(object: PlugStateRequest): string {
  switch (object) {
    case PlugStateRequest.PlugStateRequest_UNKNOWN:
      return "PlugStateRequest_UNKNOWN";
    case PlugStateRequest.PlugStateRequest_ON:
      return "PlugStateRequest_ON";
    case PlugStateRequest.PlugStateRequest_OFF:
      return "PlugStateRequest_OFF";
    case PlugStateRequest.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export enum PlugStateRequestReason {
  /** PlugStateRequestReason_UNKNOWN - Default value, used as a placeholder */
  PlugStateRequestReason_UNKNOWN = 0,
  PlugStateRequestReason_PRICE = 1,
  PlugStateRequestReason_USER = 2,
  PlugStateRequestReason_CREDIT = 3,
  UNRECOGNIZED = -1,
}

export function plugStateRequestReasonFromJSON(object: any): PlugStateRequestReason {
  switch (object) {
    case 0:
    case "PlugStateRequestReason_UNKNOWN":
      return PlugStateRequestReason.PlugStateRequestReason_UNKNOWN;
    case 1:
    case "PlugStateRequestReason_PRICE":
      return PlugStateRequestReason.PlugStateRequestReason_PRICE;
    case 2:
    case "PlugStateRequestReason_USER":
      return PlugStateRequestReason.PlugStateRequestReason_USER;
    case 3:
    case "PlugStateRequestReason_CREDIT":
      return PlugStateRequestReason.PlugStateRequestReason_CREDIT;
    case -1:
    case "UNRECOGNIZED":
    default:
      return PlugStateRequestReason.UNRECOGNIZED;
  }
}

export function plugStateRequestReasonToJSON(object: PlugStateRequestReason): string {
  switch (object) {
    case PlugStateRequestReason.PlugStateRequestReason_UNKNOWN:
      return "PlugStateRequestReason_UNKNOWN";
    case PlugStateRequestReason.PlugStateRequestReason_PRICE:
      return "PlugStateRequestReason_PRICE";
    case PlugStateRequestReason.PlugStateRequestReason_USER:
      return "PlugStateRequestReason_USER";
    case PlugStateRequestReason.PlugStateRequestReason_CREDIT:
      return "PlugStateRequestReason_CREDIT";
    case PlugStateRequestReason.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface Plug {
  /** The plug ID */
  plug_id: string;
  /** The reading for the plug */
  reading: Reading | undefined;
}

export interface PlugSettings {
  /** The name of the plug */
  name: string;
  /** The plug ID */
  plug_id: string;
  /** The strategy for the plug */
  strategy:
    | PlugStrategy
    | undefined;
  /** The current limit for the plug */
  current_limit: number;
}

export interface PlugStateRequestRecord {
  /** The plug ID */
  plug_id: string;
  state_requested: PlugStateRequest;
  timestamp_ms: number;
  user_id: string;
  reason: PlugStateRequestReason;
}

export interface PlugLocalStateRequest {
  requested_state: PlugStateRequest;
}

export interface PlugLocalStateResult {
  current_state: PlugState;
}

export interface PlugStrategy {
  /** Whether the plug requires the user to turn it on */
  always_on: boolean;
  /** People sign up to be owners if there's a strategy that requires it */
  owner_ids: string[];
  /** The duration the user is signing up to pay for the plug for */
  duration_ms: number;
}

export interface Site {
  /** The site ID */
  site_id: string;
  /** The state of the site */
  state: SiteState;
  /** The plugs at the site */
  plugs: Plug[];
  /** The IDs of the plugs at the site, used for firestore queries */
  plug_ids: string[];
  /** The timestamp of the last update in milliseconds since epoch */
  last_updated_ms: number;
}

export interface SiteSetting {
  /** The name of the site */
  name: string;
  /** The description of the site */
  description: string;
  /** The site ID */
  site_id: string;
  /** People who have admin control over the site */
  owner_ids: string[];
  /** The strategy for the site */
  strategy:
    | SiteStrategy
    | undefined;
  /** The settings for the plugs */
  plugs: PlugSettings[];
  /** Tags for the site */
  tags: string[];
}

/** may need to capture the strategy for the site as a whole */
export interface SiteStrategy {
}

export interface Reading {
  /** Indicates if the relay is currently on, off, MIA, etc. */
  state: PlugState;
  /** The current power reading in watts */
  current: number;
  /** The voltage reading in volts */
  voltage: number;
  /** Power factor, typically a value between -1 and 1 */
  power_factor: number;
  /** Timestamp of the reading in seconds since epoch */
  timestamp: number;
  /** The energy reading in kWh */
  energy: number;
}

function createBasePlug(): Plug {
  return { plug_id: "", reading: undefined };
}

export const Plug = {
  encode(message: Plug, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plug_id !== "") {
      writer.uint32(10).string(message.plug_id);
    }
    if (message.reading !== undefined) {
      Reading.encode(message.reading, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Plug {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlug();
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
          if (tag !== 18) {
            break;
          }

          message.reading = Reading.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Plug {
    return {
      plug_id: isSet(object.plug_id) ? globalThis.String(object.plug_id) : "",
      reading: isSet(object.reading) ? Reading.fromJSON(object.reading) : undefined,
    };
  },

  toJSON(message: Plug): unknown {
    const obj: any = {};
    if (message.plug_id !== "") {
      obj.plug_id = message.plug_id;
    }
    if (message.reading !== undefined) {
      obj.reading = Reading.toJSON(message.reading);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Plug>, I>>(base?: I): Plug {
    return Plug.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Plug>, I>>(object: I): Plug {
    const message = createBasePlug();
    message.plug_id = object.plug_id ?? "";
    message.reading = (object.reading !== undefined && object.reading !== null)
      ? Reading.fromPartial(object.reading)
      : undefined;
    return message;
  },
};

function createBasePlugSettings(): PlugSettings {
  return { name: "", plug_id: "", strategy: undefined, current_limit: 0 };
}

export const PlugSettings = {
  encode(message: PlugSettings, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.plug_id !== "") {
      writer.uint32(18).string(message.plug_id);
    }
    if (message.strategy !== undefined) {
      PlugStrategy.encode(message.strategy, writer.uint32(26).fork()).ldelim();
    }
    if (message.current_limit !== 0) {
      writer.uint32(33).double(message.current_limit);
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

          message.name = reader.string();
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

          message.strategy = PlugStrategy.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag !== 33) {
            break;
          }

          message.current_limit = reader.double();
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
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      plug_id: isSet(object.plug_id) ? globalThis.String(object.plug_id) : "",
      strategy: isSet(object.strategy) ? PlugStrategy.fromJSON(object.strategy) : undefined,
      current_limit: isSet(object.current_limit) ? globalThis.Number(object.current_limit) : 0,
    };
  },

  toJSON(message: PlugSettings): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.plug_id !== "") {
      obj.plug_id = message.plug_id;
    }
    if (message.strategy !== undefined) {
      obj.strategy = PlugStrategy.toJSON(message.strategy);
    }
    if (message.current_limit !== 0) {
      obj.current_limit = message.current_limit;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PlugSettings>, I>>(base?: I): PlugSettings {
    return PlugSettings.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<PlugSettings>, I>>(object: I): PlugSettings {
    const message = createBasePlugSettings();
    message.name = object.name ?? "";
    message.plug_id = object.plug_id ?? "";
    message.strategy = (object.strategy !== undefined && object.strategy !== null)
      ? PlugStrategy.fromPartial(object.strategy)
      : undefined;
    message.current_limit = object.current_limit ?? 0;
    return message;
  },
};

function createBasePlugStateRequestRecord(): PlugStateRequestRecord {
  return { plug_id: "", state_requested: 0, timestamp_ms: 0, user_id: "", reason: 0 };
}

export const PlugStateRequestRecord = {
  encode(message: PlugStateRequestRecord, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plug_id !== "") {
      writer.uint32(10).string(message.plug_id);
    }
    if (message.state_requested !== 0) {
      writer.uint32(16).int32(message.state_requested);
    }
    if (message.timestamp_ms !== 0) {
      writer.uint32(24).int64(message.timestamp_ms);
    }
    if (message.user_id !== "") {
      writer.uint32(34).string(message.user_id);
    }
    if (message.reason !== 0) {
      writer.uint32(40).int32(message.reason);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlugStateRequestRecord {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlugStateRequestRecord();
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
          if (tag !== 16) {
            break;
          }

          message.state_requested = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.timestamp_ms = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.user_id = reader.string();
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.reason = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PlugStateRequestRecord {
    return {
      plug_id: isSet(object.plug_id) ? globalThis.String(object.plug_id) : "",
      state_requested: isSet(object.state_requested) ? plugStateRequestFromJSON(object.state_requested) : 0,
      timestamp_ms: isSet(object.timestamp_ms) ? globalThis.Number(object.timestamp_ms) : 0,
      user_id: isSet(object.user_id) ? globalThis.String(object.user_id) : "",
      reason: isSet(object.reason) ? plugStateRequestReasonFromJSON(object.reason) : 0,
    };
  },

  toJSON(message: PlugStateRequestRecord): unknown {
    const obj: any = {};
    if (message.plug_id !== "") {
      obj.plug_id = message.plug_id;
    }
    if (message.state_requested !== 0) {
      obj.state_requested = plugStateRequestToJSON(message.state_requested);
    }
    if (message.timestamp_ms !== 0) {
      obj.timestamp_ms = Math.round(message.timestamp_ms);
    }
    if (message.user_id !== "") {
      obj.user_id = message.user_id;
    }
    if (message.reason !== 0) {
      obj.reason = plugStateRequestReasonToJSON(message.reason);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PlugStateRequestRecord>, I>>(base?: I): PlugStateRequestRecord {
    return PlugStateRequestRecord.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<PlugStateRequestRecord>, I>>(object: I): PlugStateRequestRecord {
    const message = createBasePlugStateRequestRecord();
    message.plug_id = object.plug_id ?? "";
    message.state_requested = object.state_requested ?? 0;
    message.timestamp_ms = object.timestamp_ms ?? 0;
    message.user_id = object.user_id ?? "";
    message.reason = object.reason ?? 0;
    return message;
  },
};

function createBasePlugLocalStateRequest(): PlugLocalStateRequest {
  return { requested_state: 0 };
}

export const PlugLocalStateRequest = {
  encode(message: PlugLocalStateRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.requested_state !== 0) {
      writer.uint32(8).int32(message.requested_state);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlugLocalStateRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlugLocalStateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.requested_state = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PlugLocalStateRequest {
    return { requested_state: isSet(object.requested_state) ? plugStateRequestFromJSON(object.requested_state) : 0 };
  },

  toJSON(message: PlugLocalStateRequest): unknown {
    const obj: any = {};
    if (message.requested_state !== 0) {
      obj.requested_state = plugStateRequestToJSON(message.requested_state);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PlugLocalStateRequest>, I>>(base?: I): PlugLocalStateRequest {
    return PlugLocalStateRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<PlugLocalStateRequest>, I>>(object: I): PlugLocalStateRequest {
    const message = createBasePlugLocalStateRequest();
    message.requested_state = object.requested_state ?? 0;
    return message;
  },
};

function createBasePlugLocalStateResult(): PlugLocalStateResult {
  return { current_state: 0 };
}

export const PlugLocalStateResult = {
  encode(message: PlugLocalStateResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.current_state !== 0) {
      writer.uint32(8).int32(message.current_state);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlugLocalStateResult {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlugLocalStateResult();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.current_state = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PlugLocalStateResult {
    return { current_state: isSet(object.current_state) ? plugStateFromJSON(object.current_state) : 0 };
  },

  toJSON(message: PlugLocalStateResult): unknown {
    const obj: any = {};
    if (message.current_state !== 0) {
      obj.current_state = plugStateToJSON(message.current_state);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PlugLocalStateResult>, I>>(base?: I): PlugLocalStateResult {
    return PlugLocalStateResult.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<PlugLocalStateResult>, I>>(object: I): PlugLocalStateResult {
    const message = createBasePlugLocalStateResult();
    message.current_state = object.current_state ?? 0;
    return message;
  },
};

function createBasePlugStrategy(): PlugStrategy {
  return { always_on: false, owner_ids: [], duration_ms: 0 };
}

export const PlugStrategy = {
  encode(message: PlugStrategy, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.always_on === true) {
      writer.uint32(8).bool(message.always_on);
    }
    for (const v of message.owner_ids) {
      writer.uint32(18).string(v!);
    }
    if (message.duration_ms !== 0) {
      writer.uint32(24).int64(message.duration_ms);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlugStrategy {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlugStrategy();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.always_on = reader.bool();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.owner_ids.push(reader.string());
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.duration_ms = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PlugStrategy {
    return {
      always_on: isSet(object.always_on) ? globalThis.Boolean(object.always_on) : false,
      owner_ids: globalThis.Array.isArray(object?.owner_ids)
        ? object.owner_ids.map((e: any) => globalThis.String(e))
        : [],
      duration_ms: isSet(object.duration_ms) ? globalThis.Number(object.duration_ms) : 0,
    };
  },

  toJSON(message: PlugStrategy): unknown {
    const obj: any = {};
    if (message.always_on === true) {
      obj.always_on = message.always_on;
    }
    if (message.owner_ids?.length) {
      obj.owner_ids = message.owner_ids;
    }
    if (message.duration_ms !== 0) {
      obj.duration_ms = Math.round(message.duration_ms);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PlugStrategy>, I>>(base?: I): PlugStrategy {
    return PlugStrategy.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<PlugStrategy>, I>>(object: I): PlugStrategy {
    const message = createBasePlugStrategy();
    message.always_on = object.always_on ?? false;
    message.owner_ids = object.owner_ids?.map((e) => e) || [];
    message.duration_ms = object.duration_ms ?? 0;
    return message;
  },
};

function createBaseSite(): Site {
  return { site_id: "", state: 0, plugs: [], plug_ids: [], last_updated_ms: 0 };
}

export const Site = {
  encode(message: Site, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.site_id !== "") {
      writer.uint32(10).string(message.site_id);
    }
    if (message.state !== 0) {
      writer.uint32(16).int32(message.state);
    }
    for (const v of message.plugs) {
      Plug.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.plug_ids) {
      writer.uint32(34).string(v!);
    }
    if (message.last_updated_ms !== 0) {
      writer.uint32(40).int64(message.last_updated_ms);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Site {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSite();
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
          if (tag !== 16) {
            break;
          }

          message.state = reader.int32() as any;
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.plugs.push(Plug.decode(reader, reader.uint32()));
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.plug_ids.push(reader.string());
          continue;
        case 5:
          if (tag !== 40) {
            break;
          }

          message.last_updated_ms = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Site {
    return {
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      state: isSet(object.state) ? siteStateFromJSON(object.state) : 0,
      plugs: globalThis.Array.isArray(object?.plugs) ? object.plugs.map((e: any) => Plug.fromJSON(e)) : [],
      plug_ids: globalThis.Array.isArray(object?.plug_ids) ? object.plug_ids.map((e: any) => globalThis.String(e)) : [],
      last_updated_ms: isSet(object.last_updated_ms) ? globalThis.Number(object.last_updated_ms) : 0,
    };
  },

  toJSON(message: Site): unknown {
    const obj: any = {};
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    if (message.state !== 0) {
      obj.state = siteStateToJSON(message.state);
    }
    if (message.plugs?.length) {
      obj.plugs = message.plugs.map((e) => Plug.toJSON(e));
    }
    if (message.plug_ids?.length) {
      obj.plug_ids = message.plug_ids;
    }
    if (message.last_updated_ms !== 0) {
      obj.last_updated_ms = Math.round(message.last_updated_ms);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Site>, I>>(base?: I): Site {
    return Site.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Site>, I>>(object: I): Site {
    const message = createBaseSite();
    message.site_id = object.site_id ?? "";
    message.state = object.state ?? 0;
    message.plugs = object.plugs?.map((e) => Plug.fromPartial(e)) || [];
    message.plug_ids = object.plug_ids?.map((e) => e) || [];
    message.last_updated_ms = object.last_updated_ms ?? 0;
    return message;
  },
};

function createBaseSiteSetting(): SiteSetting {
  return { name: "", description: "", site_id: "", owner_ids: [], strategy: undefined, plugs: [], tags: [] };
}

export const SiteSetting = {
  encode(message: SiteSetting, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    if (message.site_id !== "") {
      writer.uint32(26).string(message.site_id);
    }
    for (const v of message.owner_ids) {
      writer.uint32(34).string(v!);
    }
    if (message.strategy !== undefined) {
      SiteStrategy.encode(message.strategy, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.plugs) {
      PlugSettings.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.tags) {
      writer.uint32(58).string(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SiteSetting {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSiteSetting();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.description = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.site_id = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.owner_ids.push(reader.string());
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.strategy = SiteStrategy.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag !== 50) {
            break;
          }

          message.plugs.push(PlugSettings.decode(reader, reader.uint32()));
          continue;
        case 7:
          if (tag !== 58) {
            break;
          }

          message.tags.push(reader.string());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): SiteSetting {
    return {
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      description: isSet(object.description) ? globalThis.String(object.description) : "",
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      owner_ids: globalThis.Array.isArray(object?.owner_ids)
        ? object.owner_ids.map((e: any) => globalThis.String(e))
        : [],
      strategy: isSet(object.strategy) ? SiteStrategy.fromJSON(object.strategy) : undefined,
      plugs: globalThis.Array.isArray(object?.plugs) ? object.plugs.map((e: any) => PlugSettings.fromJSON(e)) : [],
      tags: globalThis.Array.isArray(object?.tags) ? object.tags.map((e: any) => globalThis.String(e)) : [],
    };
  },

  toJSON(message: SiteSetting): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.description !== "") {
      obj.description = message.description;
    }
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    if (message.owner_ids?.length) {
      obj.owner_ids = message.owner_ids;
    }
    if (message.strategy !== undefined) {
      obj.strategy = SiteStrategy.toJSON(message.strategy);
    }
    if (message.plugs?.length) {
      obj.plugs = message.plugs.map((e) => PlugSettings.toJSON(e));
    }
    if (message.tags?.length) {
      obj.tags = message.tags;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<SiteSetting>, I>>(base?: I): SiteSetting {
    return SiteSetting.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<SiteSetting>, I>>(object: I): SiteSetting {
    const message = createBaseSiteSetting();
    message.name = object.name ?? "";
    message.description = object.description ?? "";
    message.site_id = object.site_id ?? "";
    message.owner_ids = object.owner_ids?.map((e) => e) || [];
    message.strategy = (object.strategy !== undefined && object.strategy !== null)
      ? SiteStrategy.fromPartial(object.strategy)
      : undefined;
    message.plugs = object.plugs?.map((e) => PlugSettings.fromPartial(e)) || [];
    message.tags = object.tags?.map((e) => e) || [];
    return message;
  },
};

function createBaseSiteStrategy(): SiteStrategy {
  return {};
}

export const SiteStrategy = {
  encode(_: SiteStrategy, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SiteStrategy {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSiteStrategy();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): SiteStrategy {
    return {};
  },

  toJSON(_: SiteStrategy): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<SiteStrategy>, I>>(base?: I): SiteStrategy {
    return SiteStrategy.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<SiteStrategy>, I>>(_: I): SiteStrategy {
    const message = createBaseSiteStrategy();
    return message;
  },
};

function createBaseReading(): Reading {
  return { state: 0, current: 0, voltage: 0, power_factor: 0, timestamp: 0, energy: 0 };
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
    if (message.timestamp !== 0) {
      writer.uint32(40).int64(message.timestamp);
    }
    if (message.energy !== 0) {
      writer.uint32(49).double(message.energy);
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

          message.timestamp = longToNumber(reader.int64() as Long);
          continue;
        case 6:
          if (tag !== 49) {
            break;
          }

          message.energy = reader.double();
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
      state: isSet(object.state) ? plugStateFromJSON(object.state) : 0,
      current: isSet(object.current) ? globalThis.Number(object.current) : 0,
      voltage: isSet(object.voltage) ? globalThis.Number(object.voltage) : 0,
      power_factor: isSet(object.power_factor) ? globalThis.Number(object.power_factor) : 0,
      timestamp: isSet(object.timestamp) ? globalThis.Number(object.timestamp) : 0,
      energy: isSet(object.energy) ? globalThis.Number(object.energy) : 0,
    };
  },

  toJSON(message: Reading): unknown {
    const obj: any = {};
    if (message.state !== 0) {
      obj.state = plugStateToJSON(message.state);
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
    if (message.timestamp !== 0) {
      obj.timestamp = Math.round(message.timestamp);
    }
    if (message.energy !== 0) {
      obj.energy = message.energy;
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
    message.timestamp = object.timestamp ?? 0;
    message.energy = object.energy ?? 0;
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
