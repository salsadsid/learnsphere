export type VideoUploadRequestDto = {
  fileName: string;
  contentType: string;
  sizeBytes: number;
};

export type VideoUploadResponseDto = {
  uploadUrl: string;
  assetUrl: string;
  expiresAt: string;
};
