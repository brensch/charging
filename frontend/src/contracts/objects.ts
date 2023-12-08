/* eslint-disable */
import Long from "long"
import _m0 from "protobufjs/minimal"

export const protobufPackage = "contracts"

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
      return RequestedState.RequestedState_UNKNOWN
    case 1:
    case "RequestedState_ON":
      return RequestedState.RequestedState_ON
    case 2:
    case "RequestedState_OFF":
      return RequestedState.RequestedState_OFF
    case -1:
    case "UNRECOGNIZED":
    default:
      return RequestedState.UNRECOGNIZED
  }
}

export function requestedStateToJSON(object: RequestedState): string {
  switch (object) {
    case RequestedState.RequestedState_UNKNOWN:
      return "RequestedState_UNKNOWN"
    case RequestedState.RequestedState_ON:
      return "RequestedState_ON"
    case RequestedState.RequestedState_OFF:
      return "RequestedState_OFF"
    case RequestedState.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED"
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

export function requestedStateReasonFromJSON(
  object: any,
): RequestedStateReason {
  switch (object) {
    case 0:
    case "RequestedStateReason_UNKNOWN":
      return RequestedStateReason.RequestedStateReason_UNKNOWN
    case 1:
    case "RequestedStateReason_PRICE":
      return RequestedStateReason.RequestedStateReason_PRICE
    case 2:
    case "RequestedStateReason_USER":
      return RequestedStateReason.RequestedStateReason_USER
    case 3:
    case "RequestedStateReason_CREDIT":
      return RequestedStateReason.RequestedStateReason_CREDIT
    case -1:
    case "UNRECOGNIZED":
    default:
      return RequestedStateReason.UNRECOGNIZED
  }
}

export function requestedStateReasonToJSON(
  object: RequestedStateReason,
): string {
  switch (object) {
    case RequestedStateReason.RequestedStateReason_UNKNOWN:
      return "RequestedStateReason_UNKNOWN"
    case RequestedStateReason.RequestedStateReason_PRICE:
      return "RequestedStateReason_PRICE"
    case RequestedStateReason.RequestedStateReason_USER:
      return "RequestedStateReason_USER"
    case RequestedStateReason.RequestedStateReason_CREDIT:
      return "RequestedStateReason_CREDIT"
    case RequestedStateReason.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED"
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
      return FuzeState.FuzeState_UNKNOWN
    case 1:
    case "FuzeState_OK":
      return FuzeState.FuzeState_OK
    case 2:
    case "FuzeState_LIMITING":
      return FuzeState.FuzeState_LIMITING
    case -1:
    case "UNRECOGNIZED":
    default:
      return FuzeState.UNRECOGNIZED
  }
}

export function fuzeStateToJSON(object: FuzeState): string {
  switch (object) {
    case FuzeState.FuzeState_UNKNOWN:
      return "FuzeState_UNKNOWN"
    case FuzeState.FuzeState_OK:
      return "FuzeState_OK"
    case FuzeState.FuzeState_LIMITING:
      return "FuzeState_LIMITING"
    case FuzeState.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED"
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
      return ActualState.ActualState_UNKNOWN
    case 1:
    case "ActualState_ON":
      return ActualState.ActualState_ON
    case 2:
    case "ActualState_OFF":
      return ActualState.ActualState_OFF
    case 3:
    case "ActualState_MIA":
      return ActualState.ActualState_MIA
    case 4:
    case "ActualState_OVERCURRENT":
      return ActualState.ActualState_OVERCURRENT
    case -1:
    case "UNRECOGNIZED":
    default:
      return ActualState.UNRECOGNIZED
  }
}

export function actualStateToJSON(object: ActualState): string {
  switch (object) {
    case ActualState.ActualState_UNKNOWN:
      return "ActualState_UNKNOWN"
    case ActualState.ActualState_ON:
      return "ActualState_ON"
    case ActualState.ActualState_OFF:
      return "ActualState_OFF"
    case ActualState.ActualState_MIA:
      return "ActualState_MIA"
    case ActualState.ActualState_OVERCURRENT:
      return "ActualState_OVERCURRENT"
    case ActualState.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED"
  }
}

/**
 * FuzeGroup represents a collection of plugs that need to obey an electrical
 * limit, ie all four plugs in a shelly 4pro.
 */
export interface FuzeSettings {
  id: string
  name: string
  current_limit: number
  site_id: string
}

export interface PlugSettings {
  id: string
  name: string
  current_limit: number
  site_id: string
  owner_ids: string[]
}

export interface PlugCommand {
  /** request component */
  requested_state: RequestedState
  reason: RequestedStateReason
  time: number
  requestor: string
  command_id: string
  plug_id: string
  /** used to ack by the rpi */
  acked_at_ms: number
  acked_by_key: string
}

export interface FuzeLocalState {
  id: string
  current: number
  state: FuzeState
}

export interface PlugLocalState {
  id: string
  latest_reading: Reading | undefined
  latest_command_id: string
  latest_action_id: string
}

export interface Reading {
  /** Indicates if the relay is currently on, off, MIA, etc. */
  state: ActualState
  /** The current power reading in watts */
  current: number
  /** The voltage reading in volts */
  voltage: number
  /** Power factor, typically a value between -1 and 1 */
  power_factor: number
  /** Timestamp of the reading in seconds since epoch */
  timestamp: number
  /** The energy reading in kWh */
  energy: number
  plug_id: string
  fuze_id: string
}

export interface ReadingChunk {
  site_id: string
  readings: Reading[]
}

export interface SiteSettings {
  id: string
  name: string
  description: string
  owner_ids: string[]
  tags: string[]
}

function createBaseFuzeSettings(): FuzeSettings {
  return { id: "", name: "", current_limit: 0, site_id: "" }
}

export const FuzeSettings = {
  encode(
    message: FuzeSettings,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id)
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name)
    }
    if (message.current_limit !== 0) {
      writer.uint32(25).double(message.current_limit)
    }
    if (message.site_id !== "") {
      writer.uint32(34).string(message.site_id)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FuzeSettings {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseFuzeSettings()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break
          }

          message.id = reader.string()
          continue
        case 2:
          if (tag !== 18) {
            break
          }

          message.name = reader.string()
          continue
        case 3:
          if (tag !== 25) {
            break
          }

          message.current_limit = reader.double()
          continue
        case 4:
          if (tag !== 34) {
            break
          }

          message.site_id = reader.string()
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  fromJSON(object: any): FuzeSettings {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      current_limit: isSet(object.current_limit)
        ? globalThis.Number(object.current_limit)
        : 0,
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
    }
  },

  toJSON(message: FuzeSettings): unknown {
    const obj: any = {}
    if (message.id !== "") {
      obj.id = message.id
    }
    if (message.name !== "") {
      obj.name = message.name
    }
    if (message.current_limit !== 0) {
      obj.current_limit = message.current_limit
    }
    if (message.site_id !== "") {
      obj.site_id = message.site_id
    }
    return obj
  },

  create<I extends Exact<DeepPartial<FuzeSettings>, I>>(
    base?: I,
  ): FuzeSettings {
    return FuzeSettings.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<FuzeSettings>, I>>(
    object: I,
  ): FuzeSettings {
    const message = createBaseFuzeSettings()
    message.id = object.id ?? ""
    message.name = object.name ?? ""
    message.current_limit = object.current_limit ?? 0
    message.site_id = object.site_id ?? ""
    return message
  },
}

function createBasePlugSettings(): PlugSettings {
  return { id: "", name: "", current_limit: 0, site_id: "", owner_ids: [] }
}

export const PlugSettings = {
  encode(
    message: PlugSettings,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id)
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name)
    }
    if (message.current_limit !== 0) {
      writer.uint32(25).double(message.current_limit)
    }
    if (message.site_id !== "") {
      writer.uint32(34).string(message.site_id)
    }
    for (const v of message.owner_ids) {
      writer.uint32(42).string(v!)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlugSettings {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePlugSettings()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break
          }

          message.id = reader.string()
          continue
        case 2:
          if (tag !== 18) {
            break
          }

          message.name = reader.string()
          continue
        case 3:
          if (tag !== 25) {
            break
          }

          message.current_limit = reader.double()
          continue
        case 4:
          if (tag !== 34) {
            break
          }

          message.site_id = reader.string()
          continue
        case 5:
          if (tag !== 42) {
            break
          }

          message.owner_ids.push(reader.string())
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  fromJSON(object: any): PlugSettings {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      current_limit: isSet(object.current_limit)
        ? globalThis.Number(object.current_limit)
        : 0,
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      owner_ids: globalThis.Array.isArray(object?.owner_ids)
        ? object.owner_ids.map((e: any) => globalThis.String(e))
        : [],
    }
  },

  toJSON(message: PlugSettings): unknown {
    const obj: any = {}
    if (message.id !== "") {
      obj.id = message.id
    }
    if (message.name !== "") {
      obj.name = message.name
    }
    if (message.current_limit !== 0) {
      obj.current_limit = message.current_limit
    }
    if (message.site_id !== "") {
      obj.site_id = message.site_id
    }
    if (message.owner_ids?.length) {
      obj.owner_ids = message.owner_ids
    }
    return obj
  },

  create<I extends Exact<DeepPartial<PlugSettings>, I>>(
    base?: I,
  ): PlugSettings {
    return PlugSettings.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<PlugSettings>, I>>(
    object: I,
  ): PlugSettings {
    const message = createBasePlugSettings()
    message.id = object.id ?? ""
    message.name = object.name ?? ""
    message.current_limit = object.current_limit ?? 0
    message.site_id = object.site_id ?? ""
    message.owner_ids = object.owner_ids?.map((e) => e) || []
    return message
  },
}

function createBasePlugCommand(): PlugCommand {
  return {
    requested_state: 0,
    reason: 0,
    time: 0,
    requestor: "",
    command_id: "",
    plug_id: "",
    acked_at_ms: 0,
    acked_by_key: "",
  }
}

export const PlugCommand = {
  encode(
    message: PlugCommand,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.requested_state !== 0) {
      writer.uint32(8).int32(message.requested_state)
    }
    if (message.reason !== 0) {
      writer.uint32(16).int32(message.reason)
    }
    if (message.time !== 0) {
      writer.uint32(24).int64(message.time)
    }
    if (message.requestor !== "") {
      writer.uint32(34).string(message.requestor)
    }
    if (message.command_id !== "") {
      writer.uint32(42).string(message.command_id)
    }
    if (message.plug_id !== "") {
      writer.uint32(50).string(message.plug_id)
    }
    if (message.acked_at_ms !== 0) {
      writer.uint32(56).int64(message.acked_at_ms)
    }
    if (message.acked_by_key !== "") {
      writer.uint32(66).string(message.acked_by_key)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlugCommand {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePlugCommand()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break
          }

          message.requested_state = reader.int32() as any
          continue
        case 2:
          if (tag !== 16) {
            break
          }

          message.reason = reader.int32() as any
          continue
        case 3:
          if (tag !== 24) {
            break
          }

          message.time = longToNumber(reader.int64() as Long)
          continue
        case 4:
          if (tag !== 34) {
            break
          }

          message.requestor = reader.string()
          continue
        case 5:
          if (tag !== 42) {
            break
          }

          message.command_id = reader.string()
          continue
        case 6:
          if (tag !== 50) {
            break
          }

          message.plug_id = reader.string()
          continue
        case 7:
          if (tag !== 56) {
            break
          }

          message.acked_at_ms = longToNumber(reader.int64() as Long)
          continue
        case 8:
          if (tag !== 66) {
            break
          }

          message.acked_by_key = reader.string()
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  fromJSON(object: any): PlugCommand {
    return {
      requested_state: isSet(object.requested_state)
        ? requestedStateFromJSON(object.requested_state)
        : 0,
      reason: isSet(object.reason)
        ? requestedStateReasonFromJSON(object.reason)
        : 0,
      time: isSet(object.time) ? globalThis.Number(object.time) : 0,
      requestor: isSet(object.requestor)
        ? globalThis.String(object.requestor)
        : "",
      command_id: isSet(object.command_id)
        ? globalThis.String(object.command_id)
        : "",
      plug_id: isSet(object.plug_id) ? globalThis.String(object.plug_id) : "",
      acked_at_ms: isSet(object.acked_at_ms)
        ? globalThis.Number(object.acked_at_ms)
        : 0,
      acked_by_key: isSet(object.acked_by_key)
        ? globalThis.String(object.acked_by_key)
        : "",
    }
  },

  toJSON(message: PlugCommand): unknown {
    const obj: any = {}
    if (message.requested_state !== 0) {
      obj.requested_state = requestedStateToJSON(message.requested_state)
    }
    if (message.reason !== 0) {
      obj.reason = requestedStateReasonToJSON(message.reason)
    }
    if (message.time !== 0) {
      obj.time = Math.round(message.time)
    }
    if (message.requestor !== "") {
      obj.requestor = message.requestor
    }
    if (message.command_id !== "") {
      obj.command_id = message.command_id
    }
    if (message.plug_id !== "") {
      obj.plug_id = message.plug_id
    }
    if (message.acked_at_ms !== 0) {
      obj.acked_at_ms = Math.round(message.acked_at_ms)
    }
    if (message.acked_by_key !== "") {
      obj.acked_by_key = message.acked_by_key
    }
    return obj
  },

  create<I extends Exact<DeepPartial<PlugCommand>, I>>(base?: I): PlugCommand {
    return PlugCommand.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<PlugCommand>, I>>(
    object: I,
  ): PlugCommand {
    const message = createBasePlugCommand()
    message.requested_state = object.requested_state ?? 0
    message.reason = object.reason ?? 0
    message.time = object.time ?? 0
    message.requestor = object.requestor ?? ""
    message.command_id = object.command_id ?? ""
    message.plug_id = object.plug_id ?? ""
    message.acked_at_ms = object.acked_at_ms ?? 0
    message.acked_by_key = object.acked_by_key ?? ""
    return message
  },
}

function createBaseFuzeLocalState(): FuzeLocalState {
  return { id: "", current: 0, state: 0 }
}

export const FuzeLocalState = {
  encode(
    message: FuzeLocalState,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id)
    }
    if (message.current !== 0) {
      writer.uint32(17).double(message.current)
    }
    if (message.state !== 0) {
      writer.uint32(24).int32(message.state)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FuzeLocalState {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseFuzeLocalState()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break
          }

          message.id = reader.string()
          continue
        case 2:
          if (tag !== 17) {
            break
          }

          message.current = reader.double()
          continue
        case 3:
          if (tag !== 24) {
            break
          }

          message.state = reader.int32() as any
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  fromJSON(object: any): FuzeLocalState {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      current: isSet(object.current) ? globalThis.Number(object.current) : 0,
      state: isSet(object.state) ? fuzeStateFromJSON(object.state) : 0,
    }
  },

  toJSON(message: FuzeLocalState): unknown {
    const obj: any = {}
    if (message.id !== "") {
      obj.id = message.id
    }
    if (message.current !== 0) {
      obj.current = message.current
    }
    if (message.state !== 0) {
      obj.state = fuzeStateToJSON(message.state)
    }
    return obj
  },

  create<I extends Exact<DeepPartial<FuzeLocalState>, I>>(
    base?: I,
  ): FuzeLocalState {
    return FuzeLocalState.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<FuzeLocalState>, I>>(
    object: I,
  ): FuzeLocalState {
    const message = createBaseFuzeLocalState()
    message.id = object.id ?? ""
    message.current = object.current ?? 0
    message.state = object.state ?? 0
    return message
  },
}

function createBasePlugLocalState(): PlugLocalState {
  return {
    id: "",
    latest_reading: undefined,
    latest_command_id: "",
    latest_action_id: "",
  }
}

export const PlugLocalState = {
  encode(
    message: PlugLocalState,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id)
    }
    if (message.latest_reading !== undefined) {
      Reading.encode(message.latest_reading, writer.uint32(18).fork()).ldelim()
    }
    if (message.latest_command_id !== "") {
      writer.uint32(26).string(message.latest_command_id)
    }
    if (message.latest_action_id !== "") {
      writer.uint32(34).string(message.latest_action_id)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PlugLocalState {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePlugLocalState()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break
          }

          message.id = reader.string()
          continue
        case 2:
          if (tag !== 18) {
            break
          }

          message.latest_reading = Reading.decode(reader, reader.uint32())
          continue
        case 3:
          if (tag !== 26) {
            break
          }

          message.latest_command_id = reader.string()
          continue
        case 4:
          if (tag !== 34) {
            break
          }

          message.latest_action_id = reader.string()
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  fromJSON(object: any): PlugLocalState {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      latest_reading: isSet(object.latest_reading)
        ? Reading.fromJSON(object.latest_reading)
        : undefined,
      latest_command_id: isSet(object.latest_command_id)
        ? globalThis.String(object.latest_command_id)
        : "",
      latest_action_id: isSet(object.latest_action_id)
        ? globalThis.String(object.latest_action_id)
        : "",
    }
  },

  toJSON(message: PlugLocalState): unknown {
    const obj: any = {}
    if (message.id !== "") {
      obj.id = message.id
    }
    if (message.latest_reading !== undefined) {
      obj.latest_reading = Reading.toJSON(message.latest_reading)
    }
    if (message.latest_command_id !== "") {
      obj.latest_command_id = message.latest_command_id
    }
    if (message.latest_action_id !== "") {
      obj.latest_action_id = message.latest_action_id
    }
    return obj
  },

  create<I extends Exact<DeepPartial<PlugLocalState>, I>>(
    base?: I,
  ): PlugLocalState {
    return PlugLocalState.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<PlugLocalState>, I>>(
    object: I,
  ): PlugLocalState {
    const message = createBasePlugLocalState()
    message.id = object.id ?? ""
    message.latest_reading =
      object.latest_reading !== undefined && object.latest_reading !== null
        ? Reading.fromPartial(object.latest_reading)
        : undefined
    message.latest_command_id = object.latest_command_id ?? ""
    message.latest_action_id = object.latest_action_id ?? ""
    return message
  },
}

function createBaseReading(): Reading {
  return {
    state: 0,
    current: 0,
    voltage: 0,
    power_factor: 0,
    timestamp: 0,
    energy: 0,
    plug_id: "",
    fuze_id: "",
  }
}

export const Reading = {
  encode(
    message: Reading,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.state !== 0) {
      writer.uint32(8).int32(message.state)
    }
    if (message.current !== 0) {
      writer.uint32(17).double(message.current)
    }
    if (message.voltage !== 0) {
      writer.uint32(25).double(message.voltage)
    }
    if (message.power_factor !== 0) {
      writer.uint32(33).double(message.power_factor)
    }
    if (message.timestamp !== 0) {
      writer.uint32(40).int64(message.timestamp)
    }
    if (message.energy !== 0) {
      writer.uint32(49).double(message.energy)
    }
    if (message.plug_id !== "") {
      writer.uint32(58).string(message.plug_id)
    }
    if (message.fuze_id !== "") {
      writer.uint32(66).string(message.fuze_id)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Reading {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseReading()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break
          }

          message.state = reader.int32() as any
          continue
        case 2:
          if (tag !== 17) {
            break
          }

          message.current = reader.double()
          continue
        case 3:
          if (tag !== 25) {
            break
          }

          message.voltage = reader.double()
          continue
        case 4:
          if (tag !== 33) {
            break
          }

          message.power_factor = reader.double()
          continue
        case 5:
          if (tag !== 40) {
            break
          }

          message.timestamp = longToNumber(reader.int64() as Long)
          continue
        case 6:
          if (tag !== 49) {
            break
          }

          message.energy = reader.double()
          continue
        case 7:
          if (tag !== 58) {
            break
          }

          message.plug_id = reader.string()
          continue
        case 8:
          if (tag !== 66) {
            break
          }

          message.fuze_id = reader.string()
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  fromJSON(object: any): Reading {
    return {
      state: isSet(object.state) ? actualStateFromJSON(object.state) : 0,
      current: isSet(object.current) ? globalThis.Number(object.current) : 0,
      voltage: isSet(object.voltage) ? globalThis.Number(object.voltage) : 0,
      power_factor: isSet(object.power_factor)
        ? globalThis.Number(object.power_factor)
        : 0,
      timestamp: isSet(object.timestamp)
        ? globalThis.Number(object.timestamp)
        : 0,
      energy: isSet(object.energy) ? globalThis.Number(object.energy) : 0,
      plug_id: isSet(object.plug_id) ? globalThis.String(object.plug_id) : "",
      fuze_id: isSet(object.fuze_id) ? globalThis.String(object.fuze_id) : "",
    }
  },

  toJSON(message: Reading): unknown {
    const obj: any = {}
    if (message.state !== 0) {
      obj.state = actualStateToJSON(message.state)
    }
    if (message.current !== 0) {
      obj.current = message.current
    }
    if (message.voltage !== 0) {
      obj.voltage = message.voltage
    }
    if (message.power_factor !== 0) {
      obj.power_factor = message.power_factor
    }
    if (message.timestamp !== 0) {
      obj.timestamp = Math.round(message.timestamp)
    }
    if (message.energy !== 0) {
      obj.energy = message.energy
    }
    if (message.plug_id !== "") {
      obj.plug_id = message.plug_id
    }
    if (message.fuze_id !== "") {
      obj.fuze_id = message.fuze_id
    }
    return obj
  },

  create<I extends Exact<DeepPartial<Reading>, I>>(base?: I): Reading {
    return Reading.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<Reading>, I>>(object: I): Reading {
    const message = createBaseReading()
    message.state = object.state ?? 0
    message.current = object.current ?? 0
    message.voltage = object.voltage ?? 0
    message.power_factor = object.power_factor ?? 0
    message.timestamp = object.timestamp ?? 0
    message.energy = object.energy ?? 0
    message.plug_id = object.plug_id ?? ""
    message.fuze_id = object.fuze_id ?? ""
    return message
  },
}

function createBaseReadingChunk(): ReadingChunk {
  return { site_id: "", readings: [] }
}

export const ReadingChunk = {
  encode(
    message: ReadingChunk,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.site_id !== "") {
      writer.uint32(10).string(message.site_id)
    }
    for (const v of message.readings) {
      Reading.encode(v!, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ReadingChunk {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseReadingChunk()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break
          }

          message.site_id = reader.string()
          continue
        case 2:
          if (tag !== 18) {
            break
          }

          message.readings.push(Reading.decode(reader, reader.uint32()))
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  fromJSON(object: any): ReadingChunk {
    return {
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      readings: globalThis.Array.isArray(object?.readings)
        ? object.readings.map((e: any) => Reading.fromJSON(e))
        : [],
    }
  },

  toJSON(message: ReadingChunk): unknown {
    const obj: any = {}
    if (message.site_id !== "") {
      obj.site_id = message.site_id
    }
    if (message.readings?.length) {
      obj.readings = message.readings.map((e) => Reading.toJSON(e))
    }
    return obj
  },

  create<I extends Exact<DeepPartial<ReadingChunk>, I>>(
    base?: I,
  ): ReadingChunk {
    return ReadingChunk.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<ReadingChunk>, I>>(
    object: I,
  ): ReadingChunk {
    const message = createBaseReadingChunk()
    message.site_id = object.site_id ?? ""
    message.readings = object.readings?.map((e) => Reading.fromPartial(e)) || []
    return message
  },
}

function createBaseSiteSettings(): SiteSettings {
  return { id: "", name: "", description: "", owner_ids: [], tags: [] }
}

export const SiteSettings = {
  encode(
    message: SiteSettings,
    writer: _m0.Writer = _m0.Writer.create(),
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id)
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name)
    }
    if (message.description !== "") {
      writer.uint32(26).string(message.description)
    }
    for (const v of message.owner_ids) {
      writer.uint32(34).string(v!)
    }
    for (const v of message.tags) {
      writer.uint32(50).string(v!)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): SiteSettings {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseSiteSettings()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break
          }

          message.id = reader.string()
          continue
        case 2:
          if (tag !== 18) {
            break
          }

          message.name = reader.string()
          continue
        case 3:
          if (tag !== 26) {
            break
          }

          message.description = reader.string()
          continue
        case 4:
          if (tag !== 34) {
            break
          }

          message.owner_ids.push(reader.string())
          continue
        case 6:
          if (tag !== 50) {
            break
          }

          message.tags.push(reader.string())
          continue
      }
      if ((tag & 7) === 4 || tag === 0) {
        break
      }
      reader.skipType(tag & 7)
    }
    return message
  },

  fromJSON(object: any): SiteSettings {
    return {
      id: isSet(object.id) ? globalThis.String(object.id) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      description: isSet(object.description)
        ? globalThis.String(object.description)
        : "",
      owner_ids: globalThis.Array.isArray(object?.owner_ids)
        ? object.owner_ids.map((e: any) => globalThis.String(e))
        : [],
      tags: globalThis.Array.isArray(object?.tags)
        ? object.tags.map((e: any) => globalThis.String(e))
        : [],
    }
  },

  toJSON(message: SiteSettings): unknown {
    const obj: any = {}
    if (message.id !== "") {
      obj.id = message.id
    }
    if (message.name !== "") {
      obj.name = message.name
    }
    if (message.description !== "") {
      obj.description = message.description
    }
    if (message.owner_ids?.length) {
      obj.owner_ids = message.owner_ids
    }
    if (message.tags?.length) {
      obj.tags = message.tags
    }
    return obj
  },

  create<I extends Exact<DeepPartial<SiteSettings>, I>>(
    base?: I,
  ): SiteSettings {
    return SiteSettings.fromPartial(base ?? ({} as any))
  },
  fromPartial<I extends Exact<DeepPartial<SiteSettings>, I>>(
    object: I,
  ): SiteSettings {
    const message = createBaseSiteSettings()
    message.id = object.id ?? ""
    message.name = object.name ?? ""
    message.description = object.description ?? ""
    message.owner_ids = object.owner_ids?.map((e) => e) || []
    message.tags = object.tags?.map((e) => e) || []
    return message
  },
}

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends globalThis.Array<infer U>
  ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>

type KeysOfUnion<T> = T extends T ? keyof T : never
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & {
      [K in Exclude<keyof I, KeysOfUnion<P>>]: never
    }

function longToNumber(long: Long): number {
  if (long.gt(globalThis.Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER")
  }
  return long.toNumber()
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any
  _m0.configure()
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined
}
