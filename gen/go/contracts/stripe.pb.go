// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.31.0
// 	protoc        v3.6.1
// source: contracts/stripe.proto

package contracts

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type TransactionType int32

const (
	TransactionType_TRANSACTION_TYPE_UNSPECIFIED      TransactionType = 0
	TransactionType_TRANSACTION_TYPE_AUTOTOPUP        TransactionType = 1
	TransactionType_TRANSACTION_TYPE_MANUALTOPUP      TransactionType = 2
	TransactionType_TRANSACTION_TYPE_ELECTRICITYUSAGE TransactionType = 3
	TransactionType_TRANSACTION_TYPE_FAILURE          TransactionType = 4
)

// Enum value maps for TransactionType.
var (
	TransactionType_name = map[int32]string{
		0: "TRANSACTION_TYPE_UNSPECIFIED",
		1: "TRANSACTION_TYPE_AUTOTOPUP",
		2: "TRANSACTION_TYPE_MANUALTOPUP",
		3: "TRANSACTION_TYPE_ELECTRICITYUSAGE",
		4: "TRANSACTION_TYPE_FAILURE",
	}
	TransactionType_value = map[string]int32{
		"TRANSACTION_TYPE_UNSPECIFIED":      0,
		"TRANSACTION_TYPE_AUTOTOPUP":        1,
		"TRANSACTION_TYPE_MANUALTOPUP":      2,
		"TRANSACTION_TYPE_ELECTRICITYUSAGE": 3,
		"TRANSACTION_TYPE_FAILURE":          4,
	}
)

func (x TransactionType) Enum() *TransactionType {
	p := new(TransactionType)
	*p = x
	return p
}

func (x TransactionType) String() string {
	return protoimpl.X.EnumStringOf(x.Descriptor(), protoreflect.EnumNumber(x))
}

func (TransactionType) Descriptor() protoreflect.EnumDescriptor {
	return file_contracts_stripe_proto_enumTypes[0].Descriptor()
}

func (TransactionType) Type() protoreflect.EnumType {
	return &file_contracts_stripe_proto_enumTypes[0]
}

func (x TransactionType) Number() protoreflect.EnumNumber {
	return protoreflect.EnumNumber(x)
}

// Deprecated: Use TransactionType.Descriptor instead.
func (TransactionType) EnumDescriptor() ([]byte, []int) {
	return file_contracts_stripe_proto_rawDescGZIP(), []int{0}
}

type StripeCustomer struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	StripeId             string   `protobuf:"bytes,1,opt,name=stripe_id,json=stripeId,proto3" json:"stripe_id,omitempty" firestore:"stripe_id"`
	FirestoreId          string   `protobuf:"bytes,2,opt,name=firestore_id,json=firestoreId,proto3" json:"firestore_id,omitempty" firestore:"firestore_id"`
	PaymentMethods       []string `protobuf:"bytes,3,rep,name=payment_methods,json=paymentMethods,proto3" json:"payment_methods,omitempty" firestore:"payment_methods"`
	DefaultPaymentMethod string   `protobuf:"bytes,4,opt,name=default_payment_method,json=defaultPaymentMethod,proto3" json:"default_payment_method,omitempty" firestore:"default_payment_method"`
}

func (x *StripeCustomer) Reset() {
	*x = StripeCustomer{}
	if protoimpl.UnsafeEnabled {
		mi := &file_contracts_stripe_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *StripeCustomer) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*StripeCustomer) ProtoMessage() {}

func (x *StripeCustomer) ProtoReflect() protoreflect.Message {
	mi := &file_contracts_stripe_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use StripeCustomer.ProtoReflect.Descriptor instead.
func (*StripeCustomer) Descriptor() ([]byte, []int) {
	return file_contracts_stripe_proto_rawDescGZIP(), []int{0}
}

func (x *StripeCustomer) GetStripeId() string {
	if x != nil {
		return x.StripeId
	}
	return ""
}

func (x *StripeCustomer) GetFirestoreId() string {
	if x != nil {
		return x.FirestoreId
	}
	return ""
}

func (x *StripeCustomer) GetPaymentMethods() []string {
	if x != nil {
		return x.PaymentMethods
	}
	return nil
}

func (x *StripeCustomer) GetDefaultPaymentMethod() string {
	if x != nil {
		return x.DefaultPaymentMethod
	}
	return ""
}

type PaymentRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	FirestoreId string `protobuf:"bytes,1,opt,name=firestore_id,json=firestoreId,proto3" json:"firestore_id,omitempty" firestore:"firestore_id"`
	AmountAud   int64  `protobuf:"varint,2,opt,name=amount_aud,json=amountAud,proto3" json:"amount_aud,omitempty" firestore:"amount_aud"`
}

func (x *PaymentRequest) Reset() {
	*x = PaymentRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_contracts_stripe_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *PaymentRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*PaymentRequest) ProtoMessage() {}

func (x *PaymentRequest) ProtoReflect() protoreflect.Message {
	mi := &file_contracts_stripe_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use PaymentRequest.ProtoReflect.Descriptor instead.
func (*PaymentRequest) Descriptor() ([]byte, []int) {
	return file_contracts_stripe_proto_rawDescGZIP(), []int{1}
}

func (x *PaymentRequest) GetFirestoreId() string {
	if x != nil {
		return x.FirestoreId
	}
	return ""
}

func (x *PaymentRequest) GetAmountAud() int64 {
	if x != nil {
		return x.AmountAud
	}
	return 0
}

type Transaction struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	FirestoreId     string          `protobuf:"bytes,1,opt,name=firestore_id,json=firestoreId,proto3" json:"firestore_id,omitempty" firestore:"firestore_id"`
	PaymentMethod   string          `protobuf:"bytes,2,opt,name=payment_method,json=paymentMethod,proto3" json:"payment_method,omitempty" firestore:"payment_method"`
	CentsAud        int64           `protobuf:"varint,3,opt,name=cents_aud,json=centsAud,proto3" json:"cents_aud,omitempty" firestore:"cents_aud"`
	CompletedMs     int64           `protobuf:"varint,4,opt,name=completed_ms,json=completedMs,proto3" json:"completed_ms,omitempty" firestore:"completed_ms"`
	PaymentId       string          `protobuf:"bytes,5,opt,name=payment_id,json=paymentId,proto3" json:"payment_id,omitempty" firestore:"payment_id"`
	TransactionType TransactionType `protobuf:"varint,6,opt,name=transaction_type,json=transactionType,proto3,enum=contracts.TransactionType" json:"transaction_type,omitempty" firestore:"transaction_type"`
}

func (x *Transaction) Reset() {
	*x = Transaction{}
	if protoimpl.UnsafeEnabled {
		mi := &file_contracts_stripe_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Transaction) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Transaction) ProtoMessage() {}

func (x *Transaction) ProtoReflect() protoreflect.Message {
	mi := &file_contracts_stripe_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Transaction.ProtoReflect.Descriptor instead.
func (*Transaction) Descriptor() ([]byte, []int) {
	return file_contracts_stripe_proto_rawDescGZIP(), []int{2}
}

func (x *Transaction) GetFirestoreId() string {
	if x != nil {
		return x.FirestoreId
	}
	return ""
}

func (x *Transaction) GetPaymentMethod() string {
	if x != nil {
		return x.PaymentMethod
	}
	return ""
}

func (x *Transaction) GetCentsAud() int64 {
	if x != nil {
		return x.CentsAud
	}
	return 0
}

func (x *Transaction) GetCompletedMs() int64 {
	if x != nil {
		return x.CompletedMs
	}
	return 0
}

func (x *Transaction) GetPaymentId() string {
	if x != nil {
		return x.PaymentId
	}
	return ""
}

func (x *Transaction) GetTransactionType() TransactionType {
	if x != nil {
		return x.TransactionType
	}
	return TransactionType_TRANSACTION_TYPE_UNSPECIFIED
}

type CustomerBalance struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	FirestoreId  string `protobuf:"bytes,1,opt,name=firestore_id,json=firestoreId,proto3" json:"firestore_id,omitempty" firestore:"firestore_id"`
	CentsAud     int64  `protobuf:"varint,2,opt,name=cents_aud,json=centsAud,proto3" json:"cents_aud,omitempty" firestore:"cents_aud"` // 1000 = 1
	LastUpdateMs int64  `protobuf:"varint,3,opt,name=last_update_ms,json=lastUpdateMs,proto3" json:"last_update_ms,omitempty" firestore:"last_update_ms"`
}

func (x *CustomerBalance) Reset() {
	*x = CustomerBalance{}
	if protoimpl.UnsafeEnabled {
		mi := &file_contracts_stripe_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *CustomerBalance) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*CustomerBalance) ProtoMessage() {}

func (x *CustomerBalance) ProtoReflect() protoreflect.Message {
	mi := &file_contracts_stripe_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use CustomerBalance.ProtoReflect.Descriptor instead.
func (*CustomerBalance) Descriptor() ([]byte, []int) {
	return file_contracts_stripe_proto_rawDescGZIP(), []int{3}
}

func (x *CustomerBalance) GetFirestoreId() string {
	if x != nil {
		return x.FirestoreId
	}
	return ""
}

func (x *CustomerBalance) GetCentsAud() int64 {
	if x != nil {
		return x.CentsAud
	}
	return 0
}

func (x *CustomerBalance) GetLastUpdateMs() int64 {
	if x != nil {
		return x.LastUpdateMs
	}
	return 0
}

type AutoTopupPreferences struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	FirestoreId           string `protobuf:"bytes,1,opt,name=firestore_id,json=firestoreId,proto3" json:"firestore_id,omitempty" firestore:"firestore_id"`
	Enabled               bool   `protobuf:"varint,2,opt,name=enabled,proto3" json:"enabled,omitempty" firestore:"enabled"`
	ThresholdCents        int64  `protobuf:"varint,3,opt,name=threshold_cents,json=thresholdCents,proto3" json:"threshold_cents,omitempty" firestore:"threshold_cents"`
	RechargeValueCentsAud int64  `protobuf:"varint,4,opt,name=recharge_value_cents_aud,json=rechargeValueCentsAud,proto3" json:"recharge_value_cents_aud,omitempty" firestore:"recharge_value_cents_aud"`
}

func (x *AutoTopupPreferences) Reset() {
	*x = AutoTopupPreferences{}
	if protoimpl.UnsafeEnabled {
		mi := &file_contracts_stripe_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *AutoTopupPreferences) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*AutoTopupPreferences) ProtoMessage() {}

func (x *AutoTopupPreferences) ProtoReflect() protoreflect.Message {
	mi := &file_contracts_stripe_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use AutoTopupPreferences.ProtoReflect.Descriptor instead.
func (*AutoTopupPreferences) Descriptor() ([]byte, []int) {
	return file_contracts_stripe_proto_rawDescGZIP(), []int{4}
}

func (x *AutoTopupPreferences) GetFirestoreId() string {
	if x != nil {
		return x.FirestoreId
	}
	return ""
}

func (x *AutoTopupPreferences) GetEnabled() bool {
	if x != nil {
		return x.Enabled
	}
	return false
}

func (x *AutoTopupPreferences) GetThresholdCents() int64 {
	if x != nil {
		return x.ThresholdCents
	}
	return 0
}

func (x *AutoTopupPreferences) GetRechargeValueCentsAud() int64 {
	if x != nil {
		return x.RechargeValueCentsAud
	}
	return 0
}

var File_contracts_stripe_proto protoreflect.FileDescriptor

var file_contracts_stripe_proto_rawDesc = []byte{
	0x0a, 0x16, 0x63, 0x6f, 0x6e, 0x74, 0x72, 0x61, 0x63, 0x74, 0x73, 0x2f, 0x73, 0x74, 0x72, 0x69,
	0x70, 0x65, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x09, 0x63, 0x6f, 0x6e, 0x74, 0x72, 0x61,
	0x63, 0x74, 0x73, 0x22, 0xaf, 0x01, 0x0a, 0x0e, 0x53, 0x74, 0x72, 0x69, 0x70, 0x65, 0x43, 0x75,
	0x73, 0x74, 0x6f, 0x6d, 0x65, 0x72, 0x12, 0x1b, 0x0a, 0x09, 0x73, 0x74, 0x72, 0x69, 0x70, 0x65,
	0x5f, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x73, 0x74, 0x72, 0x69, 0x70,
	0x65, 0x49, 0x64, 0x12, 0x21, 0x0a, 0x0c, 0x66, 0x69, 0x72, 0x65, 0x73, 0x74, 0x6f, 0x72, 0x65,
	0x5f, 0x69, 0x64, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0b, 0x66, 0x69, 0x72, 0x65, 0x73,
	0x74, 0x6f, 0x72, 0x65, 0x49, 0x64, 0x12, 0x27, 0x0a, 0x0f, 0x70, 0x61, 0x79, 0x6d, 0x65, 0x6e,
	0x74, 0x5f, 0x6d, 0x65, 0x74, 0x68, 0x6f, 0x64, 0x73, 0x18, 0x03, 0x20, 0x03, 0x28, 0x09, 0x52,
	0x0e, 0x70, 0x61, 0x79, 0x6d, 0x65, 0x6e, 0x74, 0x4d, 0x65, 0x74, 0x68, 0x6f, 0x64, 0x73, 0x12,
	0x34, 0x0a, 0x16, 0x64, 0x65, 0x66, 0x61, 0x75, 0x6c, 0x74, 0x5f, 0x70, 0x61, 0x79, 0x6d, 0x65,
	0x6e, 0x74, 0x5f, 0x6d, 0x65, 0x74, 0x68, 0x6f, 0x64, 0x18, 0x04, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x14, 0x64, 0x65, 0x66, 0x61, 0x75, 0x6c, 0x74, 0x50, 0x61, 0x79, 0x6d, 0x65, 0x6e, 0x74, 0x4d,
	0x65, 0x74, 0x68, 0x6f, 0x64, 0x22, 0x52, 0x0a, 0x0e, 0x50, 0x61, 0x79, 0x6d, 0x65, 0x6e, 0x74,
	0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x21, 0x0a, 0x0c, 0x66, 0x69, 0x72, 0x65, 0x73,
	0x74, 0x6f, 0x72, 0x65, 0x5f, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0b, 0x66,
	0x69, 0x72, 0x65, 0x73, 0x74, 0x6f, 0x72, 0x65, 0x49, 0x64, 0x12, 0x1d, 0x0a, 0x0a, 0x61, 0x6d,
	0x6f, 0x75, 0x6e, 0x74, 0x5f, 0x61, 0x75, 0x64, 0x18, 0x02, 0x20, 0x01, 0x28, 0x03, 0x52, 0x09,
	0x61, 0x6d, 0x6f, 0x75, 0x6e, 0x74, 0x41, 0x75, 0x64, 0x22, 0xfd, 0x01, 0x0a, 0x0b, 0x54, 0x72,
	0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x12, 0x21, 0x0a, 0x0c, 0x66, 0x69, 0x72,
	0x65, 0x73, 0x74, 0x6f, 0x72, 0x65, 0x5f, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x0b, 0x66, 0x69, 0x72, 0x65, 0x73, 0x74, 0x6f, 0x72, 0x65, 0x49, 0x64, 0x12, 0x25, 0x0a, 0x0e,
	0x70, 0x61, 0x79, 0x6d, 0x65, 0x6e, 0x74, 0x5f, 0x6d, 0x65, 0x74, 0x68, 0x6f, 0x64, 0x18, 0x02,
	0x20, 0x01, 0x28, 0x09, 0x52, 0x0d, 0x70, 0x61, 0x79, 0x6d, 0x65, 0x6e, 0x74, 0x4d, 0x65, 0x74,
	0x68, 0x6f, 0x64, 0x12, 0x1b, 0x0a, 0x09, 0x63, 0x65, 0x6e, 0x74, 0x73, 0x5f, 0x61, 0x75, 0x64,
	0x18, 0x03, 0x20, 0x01, 0x28, 0x03, 0x52, 0x08, 0x63, 0x65, 0x6e, 0x74, 0x73, 0x41, 0x75, 0x64,
	0x12, 0x21, 0x0a, 0x0c, 0x63, 0x6f, 0x6d, 0x70, 0x6c, 0x65, 0x74, 0x65, 0x64, 0x5f, 0x6d, 0x73,
	0x18, 0x04, 0x20, 0x01, 0x28, 0x03, 0x52, 0x0b, 0x63, 0x6f, 0x6d, 0x70, 0x6c, 0x65, 0x74, 0x65,
	0x64, 0x4d, 0x73, 0x12, 0x1d, 0x0a, 0x0a, 0x70, 0x61, 0x79, 0x6d, 0x65, 0x6e, 0x74, 0x5f, 0x69,
	0x64, 0x18, 0x05, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x70, 0x61, 0x79, 0x6d, 0x65, 0x6e, 0x74,
	0x49, 0x64, 0x12, 0x45, 0x0a, 0x10, 0x74, 0x72, 0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f,
	0x6e, 0x5f, 0x74, 0x79, 0x70, 0x65, 0x18, 0x06, 0x20, 0x01, 0x28, 0x0e, 0x32, 0x1a, 0x2e, 0x63,
	0x6f, 0x6e, 0x74, 0x72, 0x61, 0x63, 0x74, 0x73, 0x2e, 0x54, 0x72, 0x61, 0x6e, 0x73, 0x61, 0x63,
	0x74, 0x69, 0x6f, 0x6e, 0x54, 0x79, 0x70, 0x65, 0x52, 0x0f, 0x74, 0x72, 0x61, 0x6e, 0x73, 0x61,
	0x63, 0x74, 0x69, 0x6f, 0x6e, 0x54, 0x79, 0x70, 0x65, 0x22, 0x77, 0x0a, 0x0f, 0x43, 0x75, 0x73,
	0x74, 0x6f, 0x6d, 0x65, 0x72, 0x42, 0x61, 0x6c, 0x61, 0x6e, 0x63, 0x65, 0x12, 0x21, 0x0a, 0x0c,
	0x66, 0x69, 0x72, 0x65, 0x73, 0x74, 0x6f, 0x72, 0x65, 0x5f, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01,
	0x28, 0x09, 0x52, 0x0b, 0x66, 0x69, 0x72, 0x65, 0x73, 0x74, 0x6f, 0x72, 0x65, 0x49, 0x64, 0x12,
	0x1b, 0x0a, 0x09, 0x63, 0x65, 0x6e, 0x74, 0x73, 0x5f, 0x61, 0x75, 0x64, 0x18, 0x02, 0x20, 0x01,
	0x28, 0x03, 0x52, 0x08, 0x63, 0x65, 0x6e, 0x74, 0x73, 0x41, 0x75, 0x64, 0x12, 0x24, 0x0a, 0x0e,
	0x6c, 0x61, 0x73, 0x74, 0x5f, 0x75, 0x70, 0x64, 0x61, 0x74, 0x65, 0x5f, 0x6d, 0x73, 0x18, 0x03,
	0x20, 0x01, 0x28, 0x03, 0x52, 0x0c, 0x6c, 0x61, 0x73, 0x74, 0x55, 0x70, 0x64, 0x61, 0x74, 0x65,
	0x4d, 0x73, 0x22, 0xb5, 0x01, 0x0a, 0x14, 0x41, 0x75, 0x74, 0x6f, 0x54, 0x6f, 0x70, 0x75, 0x70,
	0x50, 0x72, 0x65, 0x66, 0x65, 0x72, 0x65, 0x6e, 0x63, 0x65, 0x73, 0x12, 0x21, 0x0a, 0x0c, 0x66,
	0x69, 0x72, 0x65, 0x73, 0x74, 0x6f, 0x72, 0x65, 0x5f, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28,
	0x09, 0x52, 0x0b, 0x66, 0x69, 0x72, 0x65, 0x73, 0x74, 0x6f, 0x72, 0x65, 0x49, 0x64, 0x12, 0x18,
	0x0a, 0x07, 0x65, 0x6e, 0x61, 0x62, 0x6c, 0x65, 0x64, 0x18, 0x02, 0x20, 0x01, 0x28, 0x08, 0x52,
	0x07, 0x65, 0x6e, 0x61, 0x62, 0x6c, 0x65, 0x64, 0x12, 0x27, 0x0a, 0x0f, 0x74, 0x68, 0x72, 0x65,
	0x73, 0x68, 0x6f, 0x6c, 0x64, 0x5f, 0x63, 0x65, 0x6e, 0x74, 0x73, 0x18, 0x03, 0x20, 0x01, 0x28,
	0x03, 0x52, 0x0e, 0x74, 0x68, 0x72, 0x65, 0x73, 0x68, 0x6f, 0x6c, 0x64, 0x43, 0x65, 0x6e, 0x74,
	0x73, 0x12, 0x37, 0x0a, 0x18, 0x72, 0x65, 0x63, 0x68, 0x61, 0x72, 0x67, 0x65, 0x5f, 0x76, 0x61,
	0x6c, 0x75, 0x65, 0x5f, 0x63, 0x65, 0x6e, 0x74, 0x73, 0x5f, 0x61, 0x75, 0x64, 0x18, 0x04, 0x20,
	0x01, 0x28, 0x03, 0x52, 0x15, 0x72, 0x65, 0x63, 0x68, 0x61, 0x72, 0x67, 0x65, 0x56, 0x61, 0x6c,
	0x75, 0x65, 0x43, 0x65, 0x6e, 0x74, 0x73, 0x41, 0x75, 0x64, 0x2a, 0xba, 0x01, 0x0a, 0x0f, 0x54,
	0x72, 0x61, 0x6e, 0x73, 0x61, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x54, 0x79, 0x70, 0x65, 0x12, 0x20,
	0x0a, 0x1c, 0x54, 0x52, 0x41, 0x4e, 0x53, 0x41, 0x43, 0x54, 0x49, 0x4f, 0x4e, 0x5f, 0x54, 0x59,
	0x50, 0x45, 0x5f, 0x55, 0x4e, 0x53, 0x50, 0x45, 0x43, 0x49, 0x46, 0x49, 0x45, 0x44, 0x10, 0x00,
	0x12, 0x1e, 0x0a, 0x1a, 0x54, 0x52, 0x41, 0x4e, 0x53, 0x41, 0x43, 0x54, 0x49, 0x4f, 0x4e, 0x5f,
	0x54, 0x59, 0x50, 0x45, 0x5f, 0x41, 0x55, 0x54, 0x4f, 0x54, 0x4f, 0x50, 0x55, 0x50, 0x10, 0x01,
	0x12, 0x20, 0x0a, 0x1c, 0x54, 0x52, 0x41, 0x4e, 0x53, 0x41, 0x43, 0x54, 0x49, 0x4f, 0x4e, 0x5f,
	0x54, 0x59, 0x50, 0x45, 0x5f, 0x4d, 0x41, 0x4e, 0x55, 0x41, 0x4c, 0x54, 0x4f, 0x50, 0x55, 0x50,
	0x10, 0x02, 0x12, 0x25, 0x0a, 0x21, 0x54, 0x52, 0x41, 0x4e, 0x53, 0x41, 0x43, 0x54, 0x49, 0x4f,
	0x4e, 0x5f, 0x54, 0x59, 0x50, 0x45, 0x5f, 0x45, 0x4c, 0x45, 0x43, 0x54, 0x52, 0x49, 0x43, 0x49,
	0x54, 0x59, 0x55, 0x53, 0x41, 0x47, 0x45, 0x10, 0x03, 0x12, 0x1c, 0x0a, 0x18, 0x54, 0x52, 0x41,
	0x4e, 0x53, 0x41, 0x43, 0x54, 0x49, 0x4f, 0x4e, 0x5f, 0x54, 0x59, 0x50, 0x45, 0x5f, 0x46, 0x41,
	0x49, 0x4c, 0x55, 0x52, 0x45, 0x10, 0x04, 0x42, 0x0e, 0x5a, 0x0c, 0x67, 0x6f, 0x2f, 0x63, 0x6f,
	0x6e, 0x74, 0x72, 0x61, 0x63, 0x74, 0x73, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_contracts_stripe_proto_rawDescOnce sync.Once
	file_contracts_stripe_proto_rawDescData = file_contracts_stripe_proto_rawDesc
)

func file_contracts_stripe_proto_rawDescGZIP() []byte {
	file_contracts_stripe_proto_rawDescOnce.Do(func() {
		file_contracts_stripe_proto_rawDescData = protoimpl.X.CompressGZIP(file_contracts_stripe_proto_rawDescData)
	})
	return file_contracts_stripe_proto_rawDescData
}

var file_contracts_stripe_proto_enumTypes = make([]protoimpl.EnumInfo, 1)
var file_contracts_stripe_proto_msgTypes = make([]protoimpl.MessageInfo, 5)
var file_contracts_stripe_proto_goTypes = []interface{}{
	(TransactionType)(0),         // 0: contracts.TransactionType
	(*StripeCustomer)(nil),       // 1: contracts.StripeCustomer
	(*PaymentRequest)(nil),       // 2: contracts.PaymentRequest
	(*Transaction)(nil),          // 3: contracts.Transaction
	(*CustomerBalance)(nil),      // 4: contracts.CustomerBalance
	(*AutoTopupPreferences)(nil), // 5: contracts.AutoTopupPreferences
}
var file_contracts_stripe_proto_depIdxs = []int32{
	0, // 0: contracts.Transaction.transaction_type:type_name -> contracts.TransactionType
	1, // [1:1] is the sub-list for method output_type
	1, // [1:1] is the sub-list for method input_type
	1, // [1:1] is the sub-list for extension type_name
	1, // [1:1] is the sub-list for extension extendee
	0, // [0:1] is the sub-list for field type_name
}

func init() { file_contracts_stripe_proto_init() }
func file_contracts_stripe_proto_init() {
	if File_contracts_stripe_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_contracts_stripe_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*StripeCustomer); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_contracts_stripe_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*PaymentRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_contracts_stripe_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Transaction); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_contracts_stripe_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*CustomerBalance); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_contracts_stripe_proto_msgTypes[4].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*AutoTopupPreferences); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_contracts_stripe_proto_rawDesc,
			NumEnums:      1,
			NumMessages:   5,
			NumExtensions: 0,
			NumServices:   0,
		},
		GoTypes:           file_contracts_stripe_proto_goTypes,
		DependencyIndexes: file_contracts_stripe_proto_depIdxs,
		EnumInfos:         file_contracts_stripe_proto_enumTypes,
		MessageInfos:      file_contracts_stripe_proto_msgTypes,
	}.Build()
	File_contracts_stripe_proto = out.File
	file_contracts_stripe_proto_rawDesc = nil
	file_contracts_stripe_proto_goTypes = nil
	file_contracts_stripe_proto_depIdxs = nil
}
