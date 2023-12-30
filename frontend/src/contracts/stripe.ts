/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "contracts";

export interface StripeCustomer {
  stripe_id: string;
  firestore_id: string;
}

function createBaseStripeCustomer(): StripeCustomer {
  return { stripe_id: "", firestore_id: "" };
}

export const StripeCustomer = {
  encode(message: StripeCustomer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.stripe_id !== "") {
      writer.uint32(10).string(message.stripe_id);
    }
    if (message.firestore_id !== "") {
      writer.uint32(18).string(message.firestore_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): StripeCustomer {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseStripeCustomer();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.stripe_id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.firestore_id = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): StripeCustomer {
    return {
      stripe_id: isSet(object.stripe_id) ? globalThis.String(object.stripe_id) : "",
      firestore_id: isSet(object.firestore_id) ? globalThis.String(object.firestore_id) : "",
    };
  },

  toJSON(message: StripeCustomer): unknown {
    const obj: any = {};
    if (message.stripe_id !== "") {
      obj.stripe_id = message.stripe_id;
    }
    if (message.firestore_id !== "") {
      obj.firestore_id = message.firestore_id;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<StripeCustomer>, I>>(base?: I): StripeCustomer {
    return StripeCustomer.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<StripeCustomer>, I>>(object: I): StripeCustomer {
    const message = createBaseStripeCustomer();
    message.stripe_id = object.stripe_id ?? "";
    message.firestore_id = object.firestore_id ?? "";
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

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
