// types media

export interface PlatePhotoUploadResponse {
  id: string;
  platePhoto: string;
  isVerified: boolean;
  updatedAt: string;
}

export interface PlateVerificationResponse {
  id: string;
  isVerified: boolean;
  plateVerification: {
    expectedPlateNumber: string;
    extractedPlateNumber: string;
    isMatch: boolean;
  };
  updatedAt: string;
}

export interface FilePreview {
  url: string;
  name: string;
  type: string;
}
