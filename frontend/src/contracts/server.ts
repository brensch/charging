/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { PlugStrategy, Reading } from "./objects";

export const protobufPackage = "contracts";

export interface CreateSiteRequest {
  /** The name of the site */
  name: string;
}

export interface CreateSiteResponse {
  /** The ID of the created site */
  site_id: string;
}

export interface CreatePlugRequest {
  /** The site ID */
  site_id: string;
  /** The name of the plug */
  name: string;
}

export interface CreatePlugResponse {
  /** The ID of the created plug */
  plug_id: string;
}

export interface UpdatePlugRequest {
  /** The plug ID */
  plug_id: string;
  /** The site ID */
  site_id: string;
  /** new reading (will be appended to the plug's readings) */
  reading: Reading | undefined;
}

export interface UpdatePlugSettingRequest {
  /** The plug ID */
  plug_id: string;
  /** The site ID */
  site_id: string;
  /** The name of the plug */
  name: string;
  /** new reading */
  strategy: PlugStrategy | undefined;
}

export interface UpdateSiteRequest {
  /** The site ID */
  site_id: string;
  /** new reading */
  reading: Reading | undefined;
}

export interface UpdateSiteSettingRequest {
  /** The site ID */
  site_id: string;
  /** new reading */
  reading: Reading | undefined;
}

export interface UpdateResponse {
  /** Indicates if the update was successful */
  success: boolean;
  /** Optional message, like error messages or additional info */
  message: string;
}

function createBaseCreateSiteRequest(): CreateSiteRequest {
  return { name: "" };
}

export const CreateSiteRequest = {
  encode(message: CreateSiteRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateSiteRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateSiteRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.name = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CreateSiteRequest {
    return { name: isSet(object.name) ? globalThis.String(object.name) : "" };
  },

  toJSON(message: CreateSiteRequest): unknown {
    const obj: any = {};
    if (message.name !== "") {
      obj.name = message.name;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CreateSiteRequest>, I>>(base?: I): CreateSiteRequest {
    return CreateSiteRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CreateSiteRequest>, I>>(object: I): CreateSiteRequest {
    const message = createBaseCreateSiteRequest();
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseCreateSiteResponse(): CreateSiteResponse {
  return { site_id: "" };
}

export const CreateSiteResponse = {
  encode(message: CreateSiteResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.site_id !== "") {
      writer.uint32(10).string(message.site_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateSiteResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateSiteResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
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

  fromJSON(object: any): CreateSiteResponse {
    return { site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "" };
  },

  toJSON(message: CreateSiteResponse): unknown {
    const obj: any = {};
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CreateSiteResponse>, I>>(base?: I): CreateSiteResponse {
    return CreateSiteResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CreateSiteResponse>, I>>(object: I): CreateSiteResponse {
    const message = createBaseCreateSiteResponse();
    message.site_id = object.site_id ?? "";
    return message;
  },
};

function createBaseCreatePlugRequest(): CreatePlugRequest {
  return { site_id: "", name: "" };
}

export const CreatePlugRequest = {
  encode(message: CreatePlugRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.site_id !== "") {
      writer.uint32(10).string(message.site_id);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreatePlugRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreatePlugRequest();
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

          message.name = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CreatePlugRequest {
    return {
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
    };
  },

  toJSON(message: CreatePlugRequest): unknown {
    const obj: any = {};
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CreatePlugRequest>, I>>(base?: I): CreatePlugRequest {
    return CreatePlugRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CreatePlugRequest>, I>>(object: I): CreatePlugRequest {
    const message = createBaseCreatePlugRequest();
    message.site_id = object.site_id ?? "";
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseCreatePlugResponse(): CreatePlugResponse {
  return { plug_id: "" };
}

export const CreatePlugResponse = {
  encode(message: CreatePlugResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plug_id !== "") {
      writer.uint32(10).string(message.plug_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreatePlugResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreatePlugResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
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

  fromJSON(object: any): CreatePlugResponse {
    return { plug_id: isSet(object.plug_id) ? globalThis.String(object.plug_id) : "" };
  },

  toJSON(message: CreatePlugResponse): unknown {
    const obj: any = {};
    if (message.plug_id !== "") {
      obj.plug_id = message.plug_id;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CreatePlugResponse>, I>>(base?: I): CreatePlugResponse {
    return CreatePlugResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CreatePlugResponse>, I>>(object: I): CreatePlugResponse {
    const message = createBaseCreatePlugResponse();
    message.plug_id = object.plug_id ?? "";
    return message;
  },
};

function createBaseUpdatePlugRequest(): UpdatePlugRequest {
  return { plug_id: "", site_id: "", reading: undefined };
}

export const UpdatePlugRequest = {
  encode(message: UpdatePlugRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plug_id !== "") {
      writer.uint32(10).string(message.plug_id);
    }
    if (message.site_id !== "") {
      writer.uint32(18).string(message.site_id);
    }
    if (message.reading !== undefined) {
      Reading.encode(message.reading, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdatePlugRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdatePlugRequest();
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

          message.site_id = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
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

  fromJSON(object: any): UpdatePlugRequest {
    return {
      plug_id: isSet(object.plug_id) ? globalThis.String(object.plug_id) : "",
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      reading: isSet(object.reading) ? Reading.fromJSON(object.reading) : undefined,
    };
  },

  toJSON(message: UpdatePlugRequest): unknown {
    const obj: any = {};
    if (message.plug_id !== "") {
      obj.plug_id = message.plug_id;
    }
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    if (message.reading !== undefined) {
      obj.reading = Reading.toJSON(message.reading);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdatePlugRequest>, I>>(base?: I): UpdatePlugRequest {
    return UpdatePlugRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UpdatePlugRequest>, I>>(object: I): UpdatePlugRequest {
    const message = createBaseUpdatePlugRequest();
    message.plug_id = object.plug_id ?? "";
    message.site_id = object.site_id ?? "";
    message.reading = (object.reading !== undefined && object.reading !== null)
      ? Reading.fromPartial(object.reading)
      : undefined;
    return message;
  },
};

function createBaseUpdatePlugSettingRequest(): UpdatePlugSettingRequest {
  return { plug_id: "", site_id: "", name: "", strategy: undefined };
}

export const UpdatePlugSettingRequest = {
  encode(message: UpdatePlugSettingRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.plug_id !== "") {
      writer.uint32(10).string(message.plug_id);
    }
    if (message.site_id !== "") {
      writer.uint32(18).string(message.site_id);
    }
    if (message.name !== "") {
      writer.uint32(26).string(message.name);
    }
    if (message.strategy !== undefined) {
      PlugStrategy.encode(message.strategy, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdatePlugSettingRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdatePlugSettingRequest();
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

          message.site_id = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.name = reader.string();
          continue;
        case 4:
          if (tag !== 34) {
            break;
          }

          message.strategy = PlugStrategy.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UpdatePlugSettingRequest {
    return {
      plug_id: isSet(object.plug_id) ? globalThis.String(object.plug_id) : "",
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      name: isSet(object.name) ? globalThis.String(object.name) : "",
      strategy: isSet(object.strategy) ? PlugStrategy.fromJSON(object.strategy) : undefined,
    };
  },

  toJSON(message: UpdatePlugSettingRequest): unknown {
    const obj: any = {};
    if (message.plug_id !== "") {
      obj.plug_id = message.plug_id;
    }
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    if (message.name !== "") {
      obj.name = message.name;
    }
    if (message.strategy !== undefined) {
      obj.strategy = PlugStrategy.toJSON(message.strategy);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdatePlugSettingRequest>, I>>(base?: I): UpdatePlugSettingRequest {
    return UpdatePlugSettingRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UpdatePlugSettingRequest>, I>>(object: I): UpdatePlugSettingRequest {
    const message = createBaseUpdatePlugSettingRequest();
    message.plug_id = object.plug_id ?? "";
    message.site_id = object.site_id ?? "";
    message.name = object.name ?? "";
    message.strategy = (object.strategy !== undefined && object.strategy !== null)
      ? PlugStrategy.fromPartial(object.strategy)
      : undefined;
    return message;
  },
};

function createBaseUpdateSiteRequest(): UpdateSiteRequest {
  return { site_id: "", reading: undefined };
}

export const UpdateSiteRequest = {
  encode(message: UpdateSiteRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.site_id !== "") {
      writer.uint32(18).string(message.site_id);
    }
    if (message.reading !== undefined) {
      Reading.encode(message.reading, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateSiteRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateSiteRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
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

  fromJSON(object: any): UpdateSiteRequest {
    return {
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      reading: isSet(object.reading) ? Reading.fromJSON(object.reading) : undefined,
    };
  },

  toJSON(message: UpdateSiteRequest): unknown {
    const obj: any = {};
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    if (message.reading !== undefined) {
      obj.reading = Reading.toJSON(message.reading);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdateSiteRequest>, I>>(base?: I): UpdateSiteRequest {
    return UpdateSiteRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UpdateSiteRequest>, I>>(object: I): UpdateSiteRequest {
    const message = createBaseUpdateSiteRequest();
    message.site_id = object.site_id ?? "";
    message.reading = (object.reading !== undefined && object.reading !== null)
      ? Reading.fromPartial(object.reading)
      : undefined;
    return message;
  },
};

function createBaseUpdateSiteSettingRequest(): UpdateSiteSettingRequest {
  return { site_id: "", reading: undefined };
}

export const UpdateSiteSettingRequest = {
  encode(message: UpdateSiteSettingRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.site_id !== "") {
      writer.uint32(18).string(message.site_id);
    }
    if (message.reading !== undefined) {
      Reading.encode(message.reading, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateSiteSettingRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateSiteSettingRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
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

  fromJSON(object: any): UpdateSiteSettingRequest {
    return {
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      reading: isSet(object.reading) ? Reading.fromJSON(object.reading) : undefined,
    };
  },

  toJSON(message: UpdateSiteSettingRequest): unknown {
    const obj: any = {};
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    if (message.reading !== undefined) {
      obj.reading = Reading.toJSON(message.reading);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdateSiteSettingRequest>, I>>(base?: I): UpdateSiteSettingRequest {
    return UpdateSiteSettingRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UpdateSiteSettingRequest>, I>>(object: I): UpdateSiteSettingRequest {
    const message = createBaseUpdateSiteSettingRequest();
    message.site_id = object.site_id ?? "";
    message.reading = (object.reading !== undefined && object.reading !== null)
      ? Reading.fromPartial(object.reading)
      : undefined;
    return message;
  },
};

function createBaseUpdateResponse(): UpdateResponse {
  return { success: false, message: "" };
}

export const UpdateResponse = {
  encode(message: UpdateResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.success === true) {
      writer.uint32(8).bool(message.success);
    }
    if (message.message !== "") {
      writer.uint32(18).string(message.message);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.success = reader.bool();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.message = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UpdateResponse {
    return {
      success: isSet(object.success) ? globalThis.Boolean(object.success) : false,
      message: isSet(object.message) ? globalThis.String(object.message) : "",
    };
  },

  toJSON(message: UpdateResponse): unknown {
    const obj: any = {};
    if (message.success === true) {
      obj.success = message.success;
    }
    if (message.message !== "") {
      obj.message = message.message;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdateResponse>, I>>(base?: I): UpdateResponse {
    return UpdateResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UpdateResponse>, I>>(object: I): UpdateResponse {
    const message = createBaseUpdateResponse();
    message.success = object.success ?? false;
    message.message = object.message ?? "";
    return message;
  },
};

export interface UpdateService {
  UpdateSite(request: UpdateSiteRequest): Promise<UpdateResponse>;
  /** This may be done through the ui */
  UpdateSiteSetting(request: UpdateSiteSettingRequest): Promise<UpdateResponse>;
  UpdatePlug(request: UpdatePlugRequest): Promise<UpdateResponse>;
  /** This may be done through the ui */
  UpdatePlugSetting(request: UpdatePlugSettingRequest): Promise<UpdateResponse>;
  CreateSite(request: CreateSiteRequest): Promise<CreateSiteResponse>;
  CreatePlug(request: CreatePlugRequest): Promise<CreatePlugResponse>;
}

export const UpdateServiceServiceName = "contracts.UpdateService";
export class UpdateServiceClientImpl implements UpdateService {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || UpdateServiceServiceName;
    this.rpc = rpc;
    this.UpdateSite = this.UpdateSite.bind(this);
    this.UpdateSiteSetting = this.UpdateSiteSetting.bind(this);
    this.UpdatePlug = this.UpdatePlug.bind(this);
    this.UpdatePlugSetting = this.UpdatePlugSetting.bind(this);
    this.CreateSite = this.CreateSite.bind(this);
    this.CreatePlug = this.CreatePlug.bind(this);
  }
  UpdateSite(request: UpdateSiteRequest): Promise<UpdateResponse> {
    const data = UpdateSiteRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "UpdateSite", data);
    return promise.then((data) => UpdateResponse.decode(_m0.Reader.create(data)));
  }

  UpdateSiteSetting(request: UpdateSiteSettingRequest): Promise<UpdateResponse> {
    const data = UpdateSiteSettingRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "UpdateSiteSetting", data);
    return promise.then((data) => UpdateResponse.decode(_m0.Reader.create(data)));
  }

  UpdatePlug(request: UpdatePlugRequest): Promise<UpdateResponse> {
    const data = UpdatePlugRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "UpdatePlug", data);
    return promise.then((data) => UpdateResponse.decode(_m0.Reader.create(data)));
  }

  UpdatePlugSetting(request: UpdatePlugSettingRequest): Promise<UpdateResponse> {
    const data = UpdatePlugSettingRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "UpdatePlugSetting", data);
    return promise.then((data) => UpdateResponse.decode(_m0.Reader.create(data)));
  }

  CreateSite(request: CreateSiteRequest): Promise<CreateSiteResponse> {
    const data = CreateSiteRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "CreateSite", data);
    return promise.then((data) => CreateSiteResponse.decode(_m0.Reader.create(data)));
  }

  CreatePlug(request: CreatePlugRequest): Promise<CreatePlugResponse> {
    const data = CreatePlugRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "CreatePlug", data);
    return promise.then((data) => CreatePlugResponse.decode(_m0.Reader.create(data)));
  }
}

interface Rpc {
  request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends globalThis.Array<infer U> ? globalThis.Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
