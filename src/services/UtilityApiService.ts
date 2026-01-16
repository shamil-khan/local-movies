import { ApiService } from '@/services/ApiService';
import { compressImageBuffer } from '@/utils/MovieFileHelper';

class UtilityApiService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService({
      timeout: 10000,
    });
  }

  getPosterImage = async (url: string): Promise<Blob> => {
    const response = await this.apiService.get(url, {
      responseType: 'arraybuffer',
    });

    const blob = await compressImageBuffer(
      response.data as ArrayBuffer,
      response.headers['content-type'],
    );

    return blob;
  };
}

export const utilityApiService = new UtilityApiService();
