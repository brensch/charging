/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "contracts";

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

export enum ElectricalState {
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

export function electricalStateFromJSON(object: any): ElectricalState {
  switch (object) {
    case 0:
    case "PlugState_UNKNOWN":
      return ElectricalState.PlugState_UNKNOWN;
    case 1:
    case "PlugState_ON":
      return ElectricalState.PlugState_ON;
    case 2:
    case "PlugState_OFF":
      return ElectricalState.PlugState_OFF;
    case 3:
    case "PlugState_MIA":
      return ElectricalState.PlugState_MIA;
    case 4:
    case "PlugState_OVERCURRENT":
      return ElectricalState.PlugState_OVERCURRENT;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ElectricalState.UNRECOGNIZED;
  }
}

export function electricalStateToJSON(object: ElectricalState): string {
  switch (object) {
    case ElectricalState.PlugState_UNKNOWN:
      return "PlugState_UNKNOWN";
    case ElectricalState.PlugState_ON:
      return "PlugState_ON";
    case ElectricalState.PlugState_OFF:
      return "PlugState_OFF";
    case ElectricalState.PlugState_MIA:
      return "PlugState_MIA";
    case ElectricalState.PlugState_OVERCURRENT:
      return "PlugState_OVERCURRENT";
    case ElectricalState.UNRECOGNIZED:
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

export interface PlugSettings {
  id: string;
  name: string;
  current_limit: number;
  site_id: string;
  owner_ids: string[];
  state_request: PlugStateRequest;
  state_request_reason: PlugStateRequestReason;
}

export interface FuzeLocalState {
  id: string;
  current: number;
  state: FuzeState;
}

export interface PlugLocalState {
  id: string;
  latest_reading: Reading | undefined;
}

export interface Reading {
  /** Indicates if the relay is currently on, off, MIA, etc. */
  state: ElectricalState;
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
  plug_id: string;
}

export interface ReadingChunk {
  site_id: string;
  readings: Reading[];
}

export interface SiteSettings {
  id: string;
  name: string;
  description: string;
  owner_ids: string[];
  tags: string[];
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

function createBasePlugSettings(): PlugSettings {
  return { id: "", name: "", current_limit: 0, site_id: "", owner_ids: [], state_request: 0, state_request_reason: 0 };
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
    for (const v of message.owner_ids) {
      writer.uint32(42).string(v!);
    }
    if (message.state_request !== 0) {
      writer.uint32(48).int32(message.state_request);
    }
    if (message.state_request_reason !== 0) {
      writer.uint32(56).int32(message.state_request_reason);
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
          if (tag !== 42) {
            break;
          }

          message.owner_ids.push(reader.string());
          continue;
        case 6:
          if (tag !== 48) {
            break;
          }

          message.state_request = reader.int32() as any;
          continue;
        case 7:
          if (tag !== 56) {
            break;
          }

          message.state_request_reason = reader.int32() as any;
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
      owner_ids: globalThis.Array.isArray(object?.owner_ids)
        ? object.owner_ids.map((e: any) => globalThis.String(e))
        : [],
      state_request: isSet(object.state_request) ? plugStateRequestFromJSON(object.state_request) : 0,
      state_request_reason: isSet(object.state_request_reason)
        ? plugStateRequestReasonFromJSON(object.state_request_reason)
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
    if (message.owner_ids?.length) {
      obj.owner_ids = message.owner_ids;
    }
    if (message.state_request !== 0) {
      obj.state_request = plugStateRequestToJSON(message.state_request);
    }
    if (message.state_request_reason !== 0) {
      obj.state_request_reason = plugStateRequestReasonToJSON(message.state_request_reason);
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
    message.owner_ids = object.owner_ids?.map((e) => e) || [];
    message.state_request = object.state_request ?? 0;
    message.state_request_reason = object.state_request_reason ?? 0;
    return message;
  },
};

function createBaseFuzeLocalState(): FuzeLocalState {
  return { id: "", current: 0, state: 0 };
}

export const FuzeLocalState = {
  encode(message: FuzeLocalState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.current !== 0) {
      writer.uint32(17).double(message.current);
    }
    if (message.state !== 0) {
      writer.uint32(24).int32(message.state);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FuzeLocalState {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFuzeLocalState();
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
          if (tag !== 17) {
            break;
          }

          message.current = reader.double();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.state = reader.int32() as any;
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): FuzeLocalState {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      current: isSet(object.current) ? globalThis.Number(object.current) : 0,
      state: isSet(object.state) ? fuzeStateFromJSON(object.state) : 0,
    };
  },

  toJSON(message: FuzeLocalState): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.current !== 0) {
      obj.current = message.current;
    }
    if (message.state !== 0) {
      obj.state = fuzeStateToJSON(message.state);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<FuzeLocalState>, I>>(base?: I): FuzeLocalState {
    return FuzeLocalState.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<FuzeLocalState>, I>>(object: I): FuzeLocalState {
    const message = createBaseFuzeLocalState();
    message.id = object.id ?? "";
    message.current = object.current ?? 0;
    message.state = object.state ?? 0;
    return message;
  },
};

function createBasePlugLocalState(): PlugLocalState {
  return { id: "", latest_reading: undefined };
}

export const PlugLocalState = {
  encode(message: PlugLocalState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.latest_reading !== undefined) {
      Reading.encode(message.latest_reading, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlugLocalState {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlugLocalState();
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

  fromJSON(object: any): PlugLocalState {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      latest_reading: isSet(object.latest_reading) ? Reading.fromJSON(object.latest_reading) : undefined,
    };
  },

  toJSON(message: PlugLocalState): unknown {
    const obj: any = {};
    if (message.id !== "") {
      obj.id = message.id;
    }
    if (message.latest_reading !== undefined) {
      obj.latest_reading = Reading.toJSON(message.latest_reading);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PlugLocalState>, I>>(base?: I): PlugLocalState {
    return PlugLocalState.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<PlugLocalState>, I>>(object: I): PlugLocalState {
    const message = createBasePlugLocalState();
    message.id = object.id ?? "";
    message.latest_reading = (object.latest_reading !== undefined && object.latest_reading !== null)
      ? Reading.fromPartial(object.latest_reading)
      : undefined;
    return message;
  },
};

function createBaseReading(): Reading {
  return { state: 0, current: 0, voltage: 0, power_factor: 0, timestamp: 0, energy: 0, plug_id: "" };
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
    if (message.plug_id !== "") {
      writer.uint32(58).string(message.plug_id);
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
        case 7:
          if (tag !== 58) {
            break;
          }

          message.plug_id = reader.string();
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
      state: isSet(object.state) ? electricalStateFromJSON(object.state) : 0,
      current: isSet(object.current) ? globalThis.Number(object.current) : 0,
      voltage: isSet(object.voltage) ? globalThis.Number(object.voltage) : 0,
      power_factor: isSet(object.power_factor) ? globalThis.Number(object.power_factor) : 0,
      timestamp: isSet(object.timestamp) ? globalThis.Number(object.timestamp) : 0,
      energy: isSet(object.energy) ? globalThis.Number(object.energy) : 0,
      plug_id: isSet(object.plug_id) ? globalThis.String(object.plug_id) : "",
    };
  },

  toJSON(message: Reading): unknown {
    const obj: any = {};
    if (message.state !== 0) {
      obj.state = electricalStateToJSON(message.state);
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
    if (message.plug_id !== "") {
      obj.plug_id = message.plug_id;
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
    message.plug_id = object.plug_id ?? "";
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
  return { id: "", name: "", description: "", owner_ids: [], tags: [] };
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
    for (const v of message.owner_ids) {
      writer.uint32(34).string(v!);
    }
    for (const v of message.tags) {
      writer.uint32(50).string(v!);
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
        case 4:
          if (tag !== 34) {
            break;
          }

          message.owner_ids.push(reader.string());
          continue;
        case 6:
          if (tag !== 50) {
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

  fromJSON(object: any): SiteSettings {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      description: isSet(object.description) ? globalThis.String(object.description) : "",
      owner_ids: globalThis.Array.isArray(object?.owner_ids)
        ? object.owner_ids.map((e: any) => globalThis.String(e))
        : [],
      tags: globalThis.Array.isArray(object?.tags) ? object.tags.map((e: any) => globalThis.String(e)) : [],
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
    if (message.owner_ids?.length) {
      obj.owner_ids = message.owner_ids;
    }
    if (message.tags?.length) {
      obj.tags = message.tags;
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
    message.owner_ids = object.owner_ids?.map((e) => e) || [];
    message.tags = object.tags?.map((e) => e) || [];
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
