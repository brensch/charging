/* eslint-disable */
import Long from "long";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "contracts";

export enum TransactionType {
  TRANSACTION_TYPE_UNSPECIFIED = 0,
  TRANSACTION_TYPE_AUTOTOPUP = 1,
  TRANSACTION_TYPE_MANUALTOPUP = 2,
  TRANSACTION_TYPE_ELECTRICITYUSAGE = 3,
  TRANSACTION_TYPE_FAILURE = 4,
  UNRECOGNIZED = -1,
}

export function transactionTypeFromJSON(object: any): TransactionType {
  switch (object) {
    case 0:
    case "TRANSACTION_TYPE_UNSPECIFIED":
      return TransactionType.TRANSACTION_TYPE_UNSPECIFIED;
    case 1:
    case "TRANSACTION_TYPE_AUTOTOPUP":
      return TransactionType.TRANSACTION_TYPE_AUTOTOPUP;
    case 2:
    case "TRANSACTION_TYPE_MANUALTOPUP":
      return TransactionType.TRANSACTION_TYPE_MANUALTOPUP;
    case 3:
    case "TRANSACTION_TYPE_ELECTRICITYUSAGE":
      return TransactionType.TRANSACTION_TYPE_ELECTRICITYUSAGE;
    case 4:
    case "TRANSACTION_TYPE_FAILURE":
      return TransactionType.TRANSACTION_TYPE_FAILURE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return TransactionType.UNRECOGNIZED;
  }
}

export function transactionTypeToJSON(object: TransactionType): string {
  switch (object) {
    case TransactionType.TRANSACTION_TYPE_UNSPECIFIED:
      return "TRANSACTION_TYPE_UNSPECIFIED";
    case TransactionType.TRANSACTION_TYPE_AUTOTOPUP:
      return "TRANSACTION_TYPE_AUTOTOPUP";
    case TransactionType.TRANSACTION_TYPE_MANUALTOPUP:
      return "TRANSACTION_TYPE_MANUALTOPUP";
    case TransactionType.TRANSACTION_TYPE_ELECTRICITYUSAGE:
      return "TRANSACTION_TYPE_ELECTRICITYUSAGE";
    case TransactionType.TRANSACTION_TYPE_FAILURE:
      return "TRANSACTION_TYPE_FAILURE";
    case TransactionType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

export interface StripeCustomer {
  stripe_id: string;
  firestore_id: string;
  payment_methods: string[];
  default_payment_method: string;
}

export interface PaymentRequest {
  firestore_id: string;
  amount_aud: number;
}

export interface Transaction {
  firestore_id: string;
  payment_method: string;
  cents_aud: number;
  completed_ms: number;
  payment_id: string;
  transaction_type: TransactionType;
}

export interface CustomerBalance {
  firestore_id: string;
  /** 1000 = 1 */
  cents_aud: number;
  last_update_ms: number;
}

export interface AutoTopupPreferences {
  firestore_id: string;
  enabled: boolean;
  threshold_cents: number;
  recharge_value_cents_aud: number;
}

function createBaseStripeCustomer(): StripeCustomer {
  return { stripe_id: "", firestore_id: "", payment_methods: [], default_payment_method: "" };
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
    if (message.default_payment_method !== "") {
      writer.uint32(34).string(message.default_payment_method);
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
        case 4:
          if (tag !== 34) {
            break;
          }

          message.default_payment_method = reader.string();
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
      default_payment_method: isSet(object.default_payment_method)
        ? globalThis.String(object.default_payment_method)
        : "",
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
    if (message.default_payment_method !== "") {
      obj.default_payment_method = message.default_payment_method;
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
    message.default_payment_method = object.default_payment_method ?? "";
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
  return { firestore_id: "", payment_method: "", cents_aud: 0, completed_ms: 0, payment_id: "", transaction_type: 0 };
}

export const Transaction = {
  encode(message: Transaction, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.firestore_id !== "") {
      writer.uint32(10).string(message.firestore_id);
    }
    if (message.payment_method !== "") {
      writer.uint32(18).string(message.payment_method);
    }
    if (message.cents_aud !== 0) {
      writer.uint32(24).int64(message.cents_aud);
    }
    if (message.completed_ms !== 0) {
      writer.uint32(32).int64(message.completed_ms);
    }
    if (message.payment_id !== "") {
      writer.uint32(42).string(message.payment_id);
    }
    if (message.transaction_type !== 0) {
      writer.uint32(48).int32(message.transaction_type);
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

          message.cents_aud = longToNumber(reader.int64() as Long);
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
        case 6:
          if (tag !== 48) {
            break;
          }

          message.transaction_type = reader.int32() as any;
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
      cents_aud: isSet(object.cents_aud) ? globalThis.Number(object.cents_aud) : 0,
      completed_ms: isSet(object.completed_ms) ? globalThis.Number(object.completed_ms) : 0,
      payment_id: isSet(object.payment_id) ? globalThis.String(object.payment_id) : "",
      transaction_type: isSet(object.transaction_type) ? transactionTypeFromJSON(object.transaction_type) : 0,
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
    if (message.cents_aud !== 0) {
      obj.cents_aud = Math.round(message.cents_aud);
    }
    if (message.completed_ms !== 0) {
      obj.completed_ms = Math.round(message.completed_ms);
    }
    if (message.payment_id !== "") {
      obj.payment_id = message.payment_id;
    }
    if (message.transaction_type !== 0) {
      obj.transaction_type = transactionTypeToJSON(message.transaction_type);
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
    message.cents_aud = object.cents_aud ?? 0;
    message.completed_ms = object.completed_ms ?? 0;
    message.payment_id = object.payment_id ?? "";
    message.transaction_type = object.transaction_type ?? 0;
    return message;
  },
};

function createBaseCustomerBalance(): CustomerBalance {
  return { firestore_id: "", cents_aud: 0, last_update_ms: 0 };
}

export const CustomerBalance = {
  encode(message: CustomerBalance, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.firestore_id !== "") {
      writer.uint32(10).string(message.firestore_id);
    }
    if (message.cents_aud !== 0) {
      writer.uint32(16).int64(message.cents_aud);
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

          message.cents_aud = longToNumber(reader.int64() as Long);
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
      cents_aud: isSet(object.cents_aud) ? globalThis.Number(object.cents_aud) : 0,
      last_update_ms: isSet(object.last_update_ms) ? globalThis.Number(object.last_update_ms) : 0,
    };
  },

  toJSON(message: CustomerBalance): unknown {
    const obj: any = {};
    if (message.firestore_id !== "") {
      obj.firestore_id = message.firestore_id;
    }
    if (message.cents_aud !== 0) {
      obj.cents_aud = Math.round(message.cents_aud);
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
    message.cents_aud = object.cents_aud ?? 0;
    message.last_update_ms = object.last_update_ms ?? 0;
    return message;
  },
};

function createBaseAutoTopupPreferences(): AutoTopupPreferences {
  return { firestore_id: "", enabled: false, threshold_cents: 0, recharge_value_cents_aud: 0 };
}

export const AutoTopupPreferences = {
  encode(message: AutoTopupPreferences, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.firestore_id !== "") {
      writer.uint32(10).string(message.firestore_id);
    }
    if (message.enabled === true) {
      writer.uint32(16).bool(message.enabled);
    }
    if (message.threshold_cents !== 0) {
      writer.uint32(24).int64(message.threshold_cents);
    }
    if (message.recharge_value_cents_aud !== 0) {
      writer.uint32(32).int64(message.recharge_value_cents_aud);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AutoTopupPreferences {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAutoTopupPreferences();
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

          message.enabled = reader.bool();
          continue;
        case 3:
          if (tag !== 24) {
            break;
          }

          message.threshold_cents = longToNumber(reader.int64() as Long);
          continue;
        case 4:
          if (tag !== 32) {
            break;
          }

          message.recharge_value_cents_aud = longToNumber(reader.int64() as Long);
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): AutoTopupPreferences {
    return {
      firestore_id: isSet(object.firestore_id) ? globalThis.String(object.firestore_id) : "",
      enabled: isSet(object.enabled) ? globalThis.Boolean(object.enabled) : false,
      threshold_cents: isSet(object.threshold_cents) ? globalThis.Number(object.threshold_cents) : 0,
      recharge_value_cents_aud: isSet(object.recharge_value_cents_aud)
        ? globalThis.Number(object.recharge_value_cents_aud)
        : 0,
    };
  },

  toJSON(message: AutoTopupPreferences): unknown {
    const obj: any = {};
    if (message.firestore_id !== "") {
      obj.firestore_id = message.firestore_id;
    }
    if (message.enabled === true) {
      obj.enabled = message.enabled;
    }
    if (message.threshold_cents !== 0) {
      obj.threshold_cents = Math.round(message.threshold_cents);
    }
    if (message.recharge_value_cents_aud !== 0) {
      obj.recharge_value_cents_aud = Math.round(message.recharge_value_cents_aud);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<AutoTopupPreferences>, I>>(base?: I): AutoTopupPreferences {
    return AutoTopupPreferences.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<AutoTopupPreferences>, I>>(object: I): AutoTopupPreferences {
    const message = createBaseAutoTopupPreferences();
    message.firestore_id = object.firestore_id ?? "";
    message.enabled = object.enabled ?? false;
    message.threshold_cents = object.threshold_cents ?? 0;
    message.recharge_value_cents_aud = object.recharge_value_cents_aud ?? 0;
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
