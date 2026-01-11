import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import logger from '@/core/logger';

class ApiService {
  private instance: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);

    this.initializeRequestInterceptor();
    this.initializeResponseInterceptor();
  }

  private initializeRequestInterceptor() {
    this.instance.interceptors.request.use(
      this.handleRequest,
      this.handleRequestError,
    );
  }

  private initializeResponseInterceptor() {
    this.instance.interceptors.response.use(
      this.handleResponse,
      this.handleResponseError,
    );
  }

  // Request interceptor handler
  private handleRequest(
    config: InternalAxiosRequestConfig,
  ): InternalAxiosRequestConfig {
    logger.info(
      `[ApiService] Request: ${config.method?.toUpperCase()} ${config.url}`,
    );

    // Example: Attach an auth token from local storage
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  }

  // Request error handler
  private handleRequestError(error: AxiosError): Promise<AxiosError> {
    logger.error('[ApiService] Request Error:', error);
    return Promise.reject(error);
  }

  // Response interceptor handler
  private handleResponse(response: AxiosResponse): AxiosResponse {
    // Example: Log successful response data
    logger.success(
      `[ApiService] Response: ${response.status} ${response.config.url}`,
    );
    return response;
  }

  // Response error handler
  private handleResponseError(error: AxiosError): Promise<AxiosError> {
    logger.error(
      '[ApiService] Response Error:',
      error.response?.status,
      error.message,
    );

    // Example: Centralized error handling (e.g., redirect to login on 401)
    // if (error.response?.status === 401) {
    //   console.error('Unauthorized: Redirecting to login...');
    //   // window.location.href = '/login'; // Example action
    // }
    return Promise.reject(error);
  }

  // Expose the axios instance's methods for use in other parts of the app
  public async get<T>(url: string, config?: AxiosRequestConfig) {
    return await this.instance.get<T>(url, config);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return await this.instance.post<T>(url, data, config);
  }
  // Add other methods (put, delete, etc.) as needed
}

const baseURL = import.meta.env.VITE_API_URL;
logger.info(`App hosted at ${baseURL}`);

const apiService = new ApiService({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { apiService, ApiService };
