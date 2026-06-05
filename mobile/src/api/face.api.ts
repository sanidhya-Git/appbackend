import { apiClient } from './client';
import { ApiResponse, FaceQualityResult } from '../types';

export const faceApi = {
  async registerFace(imageBase64: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.post('/face/register', { imageBase64 });
    return data;
  },

  async verifyFaceQuality(imageBase64: string): Promise<ApiResponse<FaceQualityResult>> {
    const { data } = await apiClient.post('/face/verify-quality', { imageBase64 });
    return data;
  },
};
