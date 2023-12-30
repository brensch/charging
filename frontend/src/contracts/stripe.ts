/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "contracts";

export interface StripeCustomer {
  stripe_id: string;
  firestore_id: string;
  payment_methods: string[];
}

export interface PaymentRequest {
  firestore_id: string;
  amount_aud: number;
}

export interface Transaction {
  firestore_id: string;
  payment_method: string;
  amount_aud: number;
  completed_ms: number;
  payment_id: string;
}

export interface CustomerBalance {
  firestore_id: string;
  /** 1000 = 1 */
  amount_aud: number;
  last_update_ms: number;
}

function createBaseStripeCustomer(): StripeCustomer {
  return { stripe_id: "", firestore_id: "", payment_methods: [] };
}

export const StripeCustomer = {
  encode(message: StripeCustomer, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.stripe_id !== "") {
      writer.uint32(10).string(message.stripe_id);
    }
    if (message.firestore_id !== "") {
      writer.uint32(18).string(message.firestore_id);
    }
    for (const v of message.payment_methods) {
      writer.uint32(26).string(v!);
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
        case 3:
          if (tag !== 26) {
            break;
          }

          message.payment_methods.push(reader.string());
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
      payment_methods: globalThis.Array.isArray(object?.payment_methods)
        ? object.payment_methods.map((e: any) => globalThis.String(e))
        : [],
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
    if (message.payment_methods?.length) {
      obj.payment_methods = message.payment_methods;
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
    message.payment_methods = object.payment_methods?.map((e) => e) || [];
    return message;
  },
};

function createBasePaymentRequest(): PaymentRequest {
  return { firestore_id: "", amount_aud: 0 };
}

export const PaymentRequest = {
  encode(message: PaymentRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.firestore_id !== "") {
      writer.uint32(10).string(message.firestore_id);
    }
    if (message.amount_aud !== 0) {
      writer.uint32(16).int64(message.amount_aud);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PaymentRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePaymentRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.firestore_id = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.amount_aud = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PaymentRequest {
    return {
      firestore_id: isSet(object.firestore_id) ? globalThis.String(object.firestore_id) : "",
      amount_aud: isSet(object.amount_aud) ? globalThis.Number(object.amount_aud) : 0,
    };
  },

  toJSON(message: PaymentRequest): unknown {
    const obj: any = {};
    if (message.firestore_id !== "") {
      obj.firestore_id = message.firestore_id;
    }
    if (message.amount_aud !== 0) {
      obj.amount_aud = Math.round(message.amount_aud);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<PaymentRequest>, I>>(base?: I): PaymentRequest {
    return PaymentRequest.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<PaymentRequest>, I>>(object: I): PaymentRequest {
    const message = createBasePaymentRequest();
    message.firestore_id = object.firestore_id ?? "";
    message.amount_aud = object.amount_aud ?? 0;
    return message;
  },
};

function createBaseTransaction(): Transaction {
  return { firestore_id: "", payment_method: "", amount_aud: 0, completed_ms: 0, payment_id: "" };
}

export const Transaction = {
  encode(message: Transaction, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.firestore_id !== "") {
      writer.uint32(10).string(message.firestore_id);
    }
    if (message.payment_method !== "") {
      writer.uint32(18).string(message.payment_method);
    }
    if (message.amount_aud !== 0) {
      writer.uint32(24).int64(message.amount_aud);
    }
    if (message.completed_ms !== 0) {
      writer.uint32(32).int64(message.completed_ms);
    }
    if (message.payment_id !== "") {
      writer.uint32(42).string(message.payment_id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Transaction {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTransaction();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.firestore_id = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.payment_method = reader.string();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.amount_aud = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.completed_ms = longToNumber(reader.int64() as Long);
          continue;
        case 5:
          if (tag !== 42) {
            break;
          }

          message.payment_id = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): Transaction {
    return {
      firestore_id: isSet(object.firestore_id) ? globalThis.String(object.firestore_id) : "",
      payment_method: isSet(object.payment_method) ? globalThis.String(object.payment_method) : "",
      amount_aud: isSet(object.amount_aud) ? globalThis.Number(object.amount_aud) : 0,
      completed_ms: isSet(object.completed_ms) ? globalThis.Number(object.completed_ms) : 0,
      payment_id: isSet(object.payment_id) ? globalThis.String(object.payment_id) : "",
    };
  },

  toJSON(message: Transaction): unknown {
    const obj: any = {};
    if (message.firestore_id !== "") {
      obj.firestore_id = message.firestore_id;
    }
    if (message.payment_method !== "") {
      obj.payment_method = message.payment_method;
    }
    if (message.amount_aud !== 0) {
      obj.amount_aud = Math.round(message.amount_aud);
    }
    if (message.completed_ms !== 0) {
      obj.completed_ms = Math.round(message.completed_ms);
    }
    if (message.payment_id !== "") {
      obj.payment_id = message.payment_id;
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<Transaction>, I>>(base?: I): Transaction {
    return Transaction.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<Transaction>, I>>(object: I): Transaction {
    const message = createBaseTransaction();
    message.firestore_id = object.firestore_id ?? "";
    message.payment_method = object.payment_method ?? "";
    message.amount_aud = object.amount_aud ?? 0;
    message.completed_ms = object.completed_ms ?? 0;
    message.payment_id = object.payment_id ?? "";
    return message;
  },
};

function createBaseCustomerBalance(): CustomerBalance {
  return { firestore_id: "", amount_aud: 0, last_update_ms: 0 };
}

export const CustomerBalance = {
  encode(message: CustomerBalance, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.firestore_id !== "") {
      writer.uint32(10).string(message.firestore_id);
    }
    if (message.amount_aud !== 0) {
      writer.uint32(16).int64(message.amount_aud);
    }
    if (message.last_update_ms !== 0) {
      writer.uint32(24).int64(message.last_update_ms);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): CustomerBalance {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCustomerBalance();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.firestore_id = reader.string();
          continue;
        case 2:
          if (tag !== 16) {
            break;
          }

          message.amount_aud = longToNumber(reader.int64() as Long);
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.last_update_ms = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): CustomerBalance {
    return {
      firestore_id: isSet(object.firestore_id) ? globalThis.String(object.firestore_id) : "",
      amount_aud: isSet(object.amount_aud) ? globalThis.Number(object.amount_aud) : 0,
      last_update_ms: isSet(object.last_update_ms) ? globalThis.Number(object.last_update_ms) : 0,
    };
  },

  toJSON(message: CustomerBalance): unknown {
    const obj: any = {};
    if (message.firestore_id !== "") {
      obj.firestore_id = message.firestore_id;
    }
    if (message.amount_aud !== 0) {
      obj.amount_aud = Math.round(message.amount_aud);
    }
    if (message.last_update_ms !== 0) {
      obj.last_update_ms = Math.round(message.last_update_ms);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<CustomerBalance>, I>>(base?: I): CustomerBalance {
    return CustomerBalance.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<CustomerBalance>, I>>(object: I): CustomerBalance {
    const message = createBaseCustomerBalance();
    message.firestore_id = object.firestore_id ?? "";
    message.amount_aud = object.amount_aud ?? 0;
    message.last_update_ms = object.last_update_ms ?? 0;
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
