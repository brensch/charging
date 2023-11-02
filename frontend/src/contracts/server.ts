/* eslint-disable */
import _m0 from "protobufjs/minimal";
import { Site, SiteSettings } from "./objects";

export const protobufPackage = "contracts";

export interface CreateSiteRequest {
}

export interface CreateSiteResponse {
  /** The ID of the created site */
  site_id: string;
}

export interface UpdateSiteRequest {
  /** The site ID */
  updated_site: Site | undefined;
}

export interface UpdateSiteResponse {
  /** The site ID */
  site_id: string;
  message: string;
  error: string;
}

export interface UpdateSiteSettingsRequest {
  /** The site ID */
  site_settings: SiteSettings | undefined;
}

export interface UpdateSiteSettingsResponse {
  /** The site ID */
  site_id: string;
  message: string;
  error: string;
}

function createBaseCreateSiteRequest(): CreateSiteRequest {
  return {};
}

export const CreateSiteRequest = {
  encode(_: CreateSiteRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CreateSiteRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateSiteRequest();
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

  fromJSON(_: any): CreateSiteRequest {
    return {};
  },

  toJSON(_: CreateSiteRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<CreateSiteRequest>, I>>(base?: I): CreateSiteRequest {
    return CreateSiteRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CreateSiteRequest>, I>>(_: I): CreateSiteRequest {
    const message = createBaseCreateSiteRequest();
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

function createBaseUpdateSiteRequest(): UpdateSiteRequest {
  return { updated_site: undefined };
}

export const UpdateSiteRequest = {
  encode(message: UpdateSiteRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.updated_site !== undefined) {
      Site.encode(message.updated_site, writer.uint32(10).fork()).ldelim();
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
        case 1:
          if (tag !== 10) {
            break;
          }

          message.updated_site = Site.decode(reader, reader.uint32());
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
    return { updated_site: isSet(object.updated_site) ? Site.fromJSON(object.updated_site) : undefined };
  },

  toJSON(message: UpdateSiteRequest): unknown {
    const obj: any = {};
    if (message.updated_site !== undefined) {
      obj.updated_site = Site.toJSON(message.updated_site);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdateSiteRequest>, I>>(base?: I): UpdateSiteRequest {
    return UpdateSiteRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UpdateSiteRequest>, I>>(object: I): UpdateSiteRequest {
    const message = createBaseUpdateSiteRequest();
    message.updated_site = (object.updated_site !== undefined && object.updated_site !== null)
      ? Site.fromPartial(object.updated_site)
      : undefined;
    return message;
  },
};

function createBaseUpdateSiteResponse(): UpdateSiteResponse {
  return { site_id: "", message: "", error: "" };
}

export const UpdateSiteResponse = {
  encode(message: UpdateSiteResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.site_id !== "") {
      writer.uint32(10).string(message.site_id);
    }
    if (message.message !== "") {
      writer.uint32(18).string(message.message);
    }
    if (message.error !== "") {
      writer.uint32(26).string(message.error);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateSiteResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateSiteResponse();
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

          message.message = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.error = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UpdateSiteResponse {
    return {
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      message: isSet(object.message) ? globalThis.String(object.message) : "",
      error: isSet(object.error) ? globalThis.String(object.error) : "",
    };
  },

  toJSON(message: UpdateSiteResponse): unknown {
    const obj: any = {};
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    if (message.message !== "") {
      obj.message = message.message;
    }
    if (message.error !== "") {
      obj.error = message.error;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdateSiteResponse>, I>>(base?: I): UpdateSiteResponse {
    return UpdateSiteResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UpdateSiteResponse>, I>>(object: I): UpdateSiteResponse {
    const message = createBaseUpdateSiteResponse();
    message.site_id = object.site_id ?? "";
    message.message = object.message ?? "";
    message.error = object.error ?? "";
    return message;
  },
};

function createBaseUpdateSiteSettingsRequest(): UpdateSiteSettingsRequest {
  return { site_settings: undefined };
}

export const UpdateSiteSettingsRequest = {
  encode(message: UpdateSiteSettingsRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.site_settings !== undefined) {
      SiteSettings.encode(message.site_settings, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateSiteSettingsRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateSiteSettingsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.site_settings = SiteSettings.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UpdateSiteSettingsRequest {
    return { site_settings: isSet(object.site_settings) ? SiteSettings.fromJSON(object.site_settings) : undefined };
  },

  toJSON(message: UpdateSiteSettingsRequest): unknown {
    const obj: any = {};
    if (message.site_settings !== undefined) {
      obj.site_settings = SiteSettings.toJSON(message.site_settings);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdateSiteSettingsRequest>, I>>(base?: I): UpdateSiteSettingsRequest {
    return UpdateSiteSettingsRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UpdateSiteSettingsRequest>, I>>(object: I): UpdateSiteSettingsRequest {
    const message = createBaseUpdateSiteSettingsRequest();
    message.site_settings = (object.site_settings !== undefined && object.site_settings !== null)
      ? SiteSettings.fromPartial(object.site_settings)
      : undefined;
    return message;
  },
};

function createBaseUpdateSiteSettingsResponse(): UpdateSiteSettingsResponse {
  return { site_id: "", message: "", error: "" };
}

export const UpdateSiteSettingsResponse = {
  encode(message: UpdateSiteSettingsResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.site_id !== "") {
      writer.uint32(10).string(message.site_id);
    }
    if (message.message !== "") {
      writer.uint32(18).string(message.message);
    }
    if (message.error !== "") {
      writer.uint32(26).string(message.error);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): UpdateSiteSettingsResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateSiteSettingsResponse();
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

          message.message = reader.string();
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.error = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): UpdateSiteSettingsResponse {
    return {
      site_id: isSet(object.site_id) ? globalThis.String(object.site_id) : "",
      message: isSet(object.message) ? globalThis.String(object.message) : "",
      error: isSet(object.error) ? globalThis.String(object.error) : "",
    };
  },

  toJSON(message: UpdateSiteSettingsResponse): unknown {
    const obj: any = {};
    if (message.site_id !== "") {
      obj.site_id = message.site_id;
    }
    if (message.message !== "") {
      obj.message = message.message;
    }
    if (message.error !== "") {
      obj.error = message.error;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<UpdateSiteSettingsResponse>, I>>(base?: I): UpdateSiteSettingsResponse {
    return UpdateSiteSettingsResponse.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<UpdateSiteSettingsResponse>, I>>(object: I): UpdateSiteSettingsResponse {
    const message = createBaseUpdateSiteSettingsResponse();
    message.site_id = object.site_id ?? "";
    message.message = object.message ?? "";
    message.error = object.error ?? "";
    return message;
  },
};

export interface UpdateService {
  CreateSite(request: CreateSiteRequest): Promise<CreateSiteResponse>;
  UpdateSite(request: UpdateSiteRequest): Promise<UpdateSiteResponse>;
  /** This may be done through the ui */
  UpdateSiteSetting(request: UpdateSiteSettingsRequest): Promise<UpdateSiteSettingsResponse>;
}

export const UpdateServiceServiceName = "contracts.UpdateService";
export class UpdateServiceClientImpl implements UpdateService {
  private readonly rpc: Rpc;
  private readonly service: string;
  constructor(rpc: Rpc, opts?: { service?: string }) {
    this.service = opts?.service || UpdateServiceServiceName;
    this.rpc = rpc;
    this.CreateSite = this.CreateSite.bind(this);
    this.UpdateSite = this.UpdateSite.bind(this);
    this.UpdateSiteSetting = this.UpdateSiteSetting.bind(this);
  }
  CreateSite(request: CreateSiteRequest): Promise<CreateSiteResponse> {
    const data = CreateSiteRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "CreateSite", data);
    return promise.then((data) => CreateSiteResponse.decode(_m0.Reader.create(data)));
  }

  UpdateSite(request: UpdateSiteRequest): Promise<UpdateSiteResponse> {
    const data = UpdateSiteRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "UpdateSite", data);
    return promise.then((data) => UpdateSiteResponse.decode(_m0.Reader.create(data)));
  }

  UpdateSiteSetting(request: UpdateSiteSettingsRequest): Promise<UpdateSiteSettingsResponse> {
    const data = UpdateSiteSettingsRequest.encode(request).finish();
    const promise = this.rpc.request(this.service, "UpdateSiteSetting", data);
    return promise.then((data) => UpdateSiteSettingsResponse.decode(_m0.Reader.create(data)));
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
