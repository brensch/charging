// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.31.0
// 	protoc        v3.20.3
// source: contracts/server.proto

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

type CreateSiteRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Name string `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty" firestore:"name"` // The name of the site
}

func (x *CreateSiteRequest) Reset() {
	*x = CreateSiteRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_contracts_server_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *CreateSiteRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*CreateSiteRequest) ProtoMessage() {}

func (x *CreateSiteRequest) ProtoReflect() protoreflect.Message {
	mi := &file_contracts_server_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use CreateSiteRequest.ProtoReflect.Descriptor instead.
func (*CreateSiteRequest) Descriptor() ([]byte, []int) {
	return file_contracts_server_proto_rawDescGZIP(), []int{0}
}

func (x *CreateSiteRequest) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

type CreateSiteResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	SiteId string `protobuf:"bytes,1,opt,name=site_id,json=siteId,proto3" json:"site_id,omitempty" firestore:"site_id"` // The ID of the created site
}

func (x *CreateSiteResponse) Reset() {
	*x = CreateSiteResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_contracts_server_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *CreateSiteResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*CreateSiteResponse) ProtoMessage() {}

func (x *CreateSiteResponse) ProtoReflect() protoreflect.Message {
	mi := &file_contracts_server_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use CreateSiteResponse.ProtoReflect.Descriptor instead.
func (*CreateSiteResponse) Descriptor() ([]byte, []int) {
	return file_contracts_server_proto_rawDescGZIP(), []int{1}
}

func (x *CreateSiteResponse) GetSiteId() string {
	if x != nil {
		return x.SiteId
	}
	return ""
}

type UpdateSiteRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	UpdatedSite *Site `protobuf:"bytes,1,opt,name=updated_site,json=updatedSite,proto3" json:"updated_site,omitempty" firestore:"updated_site"` // The site ID
}

func (x *UpdateSiteRequest) Reset() {
	*x = UpdateSiteRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_contracts_server_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *UpdateSiteRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*UpdateSiteRequest) ProtoMessage() {}

func (x *UpdateSiteRequest) ProtoReflect() protoreflect.Message {
	mi := &file_contracts_server_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use UpdateSiteRequest.ProtoReflect.Descriptor instead.
func (*UpdateSiteRequest) Descriptor() ([]byte, []int) {
	return file_contracts_server_proto_rawDescGZIP(), []int{2}
}

func (x *UpdateSiteRequest) GetUpdatedSite() *Site {
	if x != nil {
		return x.UpdatedSite
	}
	return nil
}

type UpdateSiteResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	SiteId  string `protobuf:"bytes,1,opt,name=site_id,json=siteId,proto3" json:"site_id,omitempty" firestore:"site_id"` // The site ID
	Message string `protobuf:"bytes,2,opt,name=message,proto3" json:"message,omitempty" firestore:"message"`
	Error   string `protobuf:"bytes,3,opt,name=error,proto3" json:"error,omitempty" firestore:"error"`
}

func (x *UpdateSiteResponse) Reset() {
	*x = UpdateSiteResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_contracts_server_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *UpdateSiteResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*UpdateSiteResponse) ProtoMessage() {}

func (x *UpdateSiteResponse) ProtoReflect() protoreflect.Message {
	mi := &file_contracts_server_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use UpdateSiteResponse.ProtoReflect.Descriptor instead.
func (*UpdateSiteResponse) Descriptor() ([]byte, []int) {
	return file_contracts_server_proto_rawDescGZIP(), []int{3}
}

func (x *UpdateSiteResponse) GetSiteId() string {
	if x != nil {
		return x.SiteId
	}
	return ""
}

func (x *UpdateSiteResponse) GetMessage() string {
	if x != nil {
		return x.Message
	}
	return ""
}

func (x *UpdateSiteResponse) GetError() string {
	if x != nil {
		return x.Error
	}
	return ""
}

type UpdateSiteSettingsRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	SiteSettings *SiteSetting `protobuf:"bytes,1,opt,name=site_settings,json=siteSettings,proto3" json:"site_settings,omitempty" firestore:"site_settings"` // The site ID
}

func (x *UpdateSiteSettingsRequest) Reset() {
	*x = UpdateSiteSettingsRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_contracts_server_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *UpdateSiteSettingsRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*UpdateSiteSettingsRequest) ProtoMessage() {}

func (x *UpdateSiteSettingsRequest) ProtoReflect() protoreflect.Message {
	mi := &file_contracts_server_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use UpdateSiteSettingsRequest.ProtoReflect.Descriptor instead.
func (*UpdateSiteSettingsRequest) Descriptor() ([]byte, []int) {
	return file_contracts_server_proto_rawDescGZIP(), []int{4}
}

func (x *UpdateSiteSettingsRequest) GetSiteSettings() *SiteSetting {
	if x != nil {
		return x.SiteSettings
	}
	return nil
}

type UpdateSiteSettingsResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	SiteId  string `protobuf:"bytes,1,opt,name=site_id,json=siteId,proto3" json:"site_id,omitempty" firestore:"site_id"` // The site ID
	Message string `protobuf:"bytes,2,opt,name=message,proto3" json:"message,omitempty" firestore:"message"`
	Error   string `protobuf:"bytes,3,opt,name=error,proto3" json:"error,omitempty" firestore:"error"`
}

func (x *UpdateSiteSettingsResponse) Reset() {
	*x = UpdateSiteSettingsResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_contracts_server_proto_msgTypes[5]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *UpdateSiteSettingsResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*UpdateSiteSettingsResponse) ProtoMessage() {}

func (x *UpdateSiteSettingsResponse) ProtoReflect() protoreflect.Message {
	mi := &file_contracts_server_proto_msgTypes[5]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use UpdateSiteSettingsResponse.ProtoReflect.Descriptor instead.
func (*UpdateSiteSettingsResponse) Descriptor() ([]byte, []int) {
	return file_contracts_server_proto_rawDescGZIP(), []int{5}
}

func (x *UpdateSiteSettingsResponse) GetSiteId() string {
	if x != nil {
		return x.SiteId
	}
	return ""
}

func (x *UpdateSiteSettingsResponse) GetMessage() string {
	if x != nil {
		return x.Message
	}
	return ""
}

func (x *UpdateSiteSettingsResponse) GetError() string {
	if x != nil {
		return x.Error
	}
	return ""
}

var File_contracts_server_proto protoreflect.FileDescriptor

var file_contracts_server_proto_rawDesc = []byte{
	0x0a, 0x16, 0x63, 0x6f, 0x6e, 0x74, 0x72, 0x61, 0x63, 0x74, 0x73, 0x2f, 0x73, 0x65, 0x72, 0x76,
	0x65, 0x72, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x09, 0x63, 0x6f, 0x6e, 0x74, 0x72, 0x61,
	0x63, 0x74, 0x73, 0x1a, 0x17, 0x63, 0x6f, 0x6e, 0x74, 0x72, 0x61, 0x63, 0x74, 0x73, 0x2f, 0x6f,
	0x62, 0x6a, 0x65, 0x63, 0x74, 0x73, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x22, 0x27, 0x0a, 0x11,
	0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x53, 0x69, 0x74, 0x65, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73,
	0x74, 0x12, 0x12, 0x0a, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x04, 0x6e, 0x61, 0x6d, 0x65, 0x22, 0x2d, 0x0a, 0x12, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x53,
	0x69, 0x74, 0x65, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x17, 0x0a, 0x07, 0x73,
	0x69, 0x74, 0x65, 0x5f, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x06, 0x73, 0x69,
	0x74, 0x65, 0x49, 0x64, 0x22, 0x47, 0x0a, 0x11, 0x55, 0x70, 0x64, 0x61, 0x74, 0x65, 0x53, 0x69,
	0x74, 0x65, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x32, 0x0a, 0x0c, 0x75, 0x70, 0x64,
	0x61, 0x74, 0x65, 0x64, 0x5f, 0x73, 0x69, 0x74, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0b, 0x32,
	0x0f, 0x2e, 0x63, 0x6f, 0x6e, 0x74, 0x72, 0x61, 0x63, 0x74, 0x73, 0x2e, 0x53, 0x69, 0x74, 0x65,
	0x52, 0x0b, 0x75, 0x70, 0x64, 0x61, 0x74, 0x65, 0x64, 0x53, 0x69, 0x74, 0x65, 0x22, 0x5d, 0x0a,
	0x12, 0x55, 0x70, 0x64, 0x61, 0x74, 0x65, 0x53, 0x69, 0x74, 0x65, 0x52, 0x65, 0x73, 0x70, 0x6f,
	0x6e, 0x73, 0x65, 0x12, 0x17, 0x0a, 0x07, 0x73, 0x69, 0x74, 0x65, 0x5f, 0x69, 0x64, 0x18, 0x01,
	0x20, 0x01, 0x28, 0x09, 0x52, 0x06, 0x73, 0x69, 0x74, 0x65, 0x49, 0x64, 0x12, 0x18, 0x0a, 0x07,
	0x6d, 0x65, 0x73, 0x73, 0x61, 0x67, 0x65, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x07, 0x6d,
	0x65, 0x73, 0x73, 0x61, 0x67, 0x65, 0x12, 0x14, 0x0a, 0x05, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x18,
	0x03, 0x20, 0x01, 0x28, 0x09, 0x52, 0x05, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x22, 0x58, 0x0a, 0x19,
	0x55, 0x70, 0x64, 0x61, 0x74, 0x65, 0x53, 0x69, 0x74, 0x65, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e,
	0x67, 0x73, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x3b, 0x0a, 0x0d, 0x73, 0x69, 0x74,
	0x65, 0x5f, 0x73, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0b,
	0x32, 0x16, 0x2e, 0x63, 0x6f, 0x6e, 0x74, 0x72, 0x61, 0x63, 0x74, 0x73, 0x2e, 0x53, 0x69, 0x74,
	0x65, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x52, 0x0c, 0x73, 0x69, 0x74, 0x65, 0x53, 0x65,
	0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x22, 0x65, 0x0a, 0x1a, 0x55, 0x70, 0x64, 0x61, 0x74, 0x65,
	0x53, 0x69, 0x74, 0x65, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x52, 0x65, 0x73, 0x70,
	0x6f, 0x6e, 0x73, 0x65, 0x12, 0x17, 0x0a, 0x07, 0x73, 0x69, 0x74, 0x65, 0x5f, 0x69, 0x64, 0x18,
	0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x06, 0x73, 0x69, 0x74, 0x65, 0x49, 0x64, 0x12, 0x18, 0x0a,
	0x07, 0x6d, 0x65, 0x73, 0x73, 0x61, 0x67, 0x65, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x07,
	0x6d, 0x65, 0x73, 0x73, 0x61, 0x67, 0x65, 0x12, 0x14, 0x0a, 0x05, 0x65, 0x72, 0x72, 0x6f, 0x72,
	0x18, 0x03, 0x20, 0x01, 0x28, 0x09, 0x52, 0x05, 0x65, 0x72, 0x72, 0x6f, 0x72, 0x32, 0x87, 0x02,
	0x0a, 0x0d, 0x55, 0x70, 0x64, 0x61, 0x74, 0x65, 0x53, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x12,
	0x49, 0x0a, 0x0a, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x53, 0x69, 0x74, 0x65, 0x12, 0x1c, 0x2e,
	0x63, 0x6f, 0x6e, 0x74, 0x72, 0x61, 0x63, 0x74, 0x73, 0x2e, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65,
	0x53, 0x69, 0x74, 0x65, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x1d, 0x2e, 0x63, 0x6f,
	0x6e, 0x74, 0x72, 0x61, 0x63, 0x74, 0x73, 0x2e, 0x43, 0x72, 0x65, 0x61, 0x74, 0x65, 0x53, 0x69,
	0x74, 0x65, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x49, 0x0a, 0x0a, 0x55, 0x70,
	0x64, 0x61, 0x74, 0x65, 0x53, 0x69, 0x74, 0x65, 0x12, 0x1c, 0x2e, 0x63, 0x6f, 0x6e, 0x74, 0x72,
	0x61, 0x63, 0x74, 0x73, 0x2e, 0x55, 0x70, 0x64, 0x61, 0x74, 0x65, 0x53, 0x69, 0x74, 0x65, 0x52,
	0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x1d, 0x2e, 0x63, 0x6f, 0x6e, 0x74, 0x72, 0x61, 0x63,
	0x74, 0x73, 0x2e, 0x55, 0x70, 0x64, 0x61, 0x74, 0x65, 0x53, 0x69, 0x74, 0x65, 0x52, 0x65, 0x73,
	0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x60, 0x0a, 0x11, 0x55, 0x70, 0x64, 0x61, 0x74, 0x65, 0x53,
	0x69, 0x74, 0x65, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x12, 0x24, 0x2e, 0x63, 0x6f, 0x6e,
	0x74, 0x72, 0x61, 0x63, 0x74, 0x73, 0x2e, 0x55, 0x70, 0x64, 0x61, 0x74, 0x65, 0x53, 0x69, 0x74,
	0x65, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74,
	0x1a, 0x25, 0x2e, 0x63, 0x6f, 0x6e, 0x74, 0x72, 0x61, 0x63, 0x74, 0x73, 0x2e, 0x55, 0x70, 0x64,
	0x61, 0x74, 0x65, 0x53, 0x69, 0x74, 0x65, 0x53, 0x65, 0x74, 0x74, 0x69, 0x6e, 0x67, 0x73, 0x52,
	0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x42, 0x0e, 0x5a, 0x0c, 0x67, 0x6f, 0x2f, 0x63, 0x6f,
	0x6e, 0x74, 0x72, 0x61, 0x63, 0x74, 0x73, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_contracts_server_proto_rawDescOnce sync.Once
	file_contracts_server_proto_rawDescData = file_contracts_server_proto_rawDesc
)

func file_contracts_server_proto_rawDescGZIP() []byte {
	file_contracts_server_proto_rawDescOnce.Do(func() {
		file_contracts_server_proto_rawDescData = protoimpl.X.CompressGZIP(file_contracts_server_proto_rawDescData)
	})
	return file_contracts_server_proto_rawDescData
}

var file_contracts_server_proto_msgTypes = make([]protoimpl.MessageInfo, 6)
var file_contracts_server_proto_goTypes = []interface{}{
	(*CreateSiteRequest)(nil),          // 0: contracts.CreateSiteRequest
	(*CreateSiteResponse)(nil),         // 1: contracts.CreateSiteResponse
	(*UpdateSiteRequest)(nil),          // 2: contracts.UpdateSiteRequest
	(*UpdateSiteResponse)(nil),         // 3: contracts.UpdateSiteResponse
	(*UpdateSiteSettingsRequest)(nil),  // 4: contracts.UpdateSiteSettingsRequest
	(*UpdateSiteSettingsResponse)(nil), // 5: contracts.UpdateSiteSettingsResponse
	(*Site)(nil),                       // 6: contracts.Site
	(*SiteSetting)(nil),                // 7: contracts.SiteSetting
}
var file_contracts_server_proto_depIdxs = []int32{
	6, // 0: contracts.UpdateSiteRequest.updated_site:type_name -> contracts.Site
	7, // 1: contracts.UpdateSiteSettingsRequest.site_settings:type_name -> contracts.SiteSetting
	0, // 2: contracts.UpdateService.CreateSite:input_type -> contracts.CreateSiteRequest
	2, // 3: contracts.UpdateService.UpdateSite:input_type -> contracts.UpdateSiteRequest
	4, // 4: contracts.UpdateService.UpdateSiteSetting:input_type -> contracts.UpdateSiteSettingsRequest
	1, // 5: contracts.UpdateService.CreateSite:output_type -> contracts.CreateSiteResponse
	3, // 6: contracts.UpdateService.UpdateSite:output_type -> contracts.UpdateSiteResponse
	5, // 7: contracts.UpdateService.UpdateSiteSetting:output_type -> contracts.UpdateSiteSettingsResponse
	5, // [5:8] is the sub-list for method output_type
	2, // [2:5] is the sub-list for method input_type
	2, // [2:2] is the sub-list for extension type_name
	2, // [2:2] is the sub-list for extension extendee
	0, // [0:2] is the sub-list for field type_name
}

func init() { file_contracts_server_proto_init() }
func file_contracts_server_proto_init() {
	if File_contracts_server_proto != nil {
		return
	}
	file_contracts_objects_proto_init()
	if !protoimpl.UnsafeEnabled {
		file_contracts_server_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*CreateSiteRequest); i {
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
		file_contracts_server_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*CreateSiteResponse); i {
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
		file_contracts_server_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*UpdateSiteRequest); i {
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
		file_contracts_server_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*UpdateSiteResponse); i {
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
		file_contracts_server_proto_msgTypes[4].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*UpdateSiteSettingsRequest); i {
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
		file_contracts_server_proto_msgTypes[5].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*UpdateSiteSettingsResponse); i {
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
			RawDescriptor: file_contracts_server_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   6,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_contracts_server_proto_goTypes,
		DependencyIndexes: file_contracts_server_proto_depIdxs,
		MessageInfos:      file_contracts_server_proto_msgTypes,
	}.Build()
	File_contracts_server_proto = out.File
	file_contracts_server_proto_rawDesc = nil
	file_contracts_server_proto_goTypes = nil
	file_contracts_server_proto_depIdxs = nil
}