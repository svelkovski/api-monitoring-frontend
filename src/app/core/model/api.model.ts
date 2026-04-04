export interface Api {
  name: string;
  url: string;
  method: string;
  status: string;
  responseTime: number | null;
  responseCode: number;
  checkedAt: string;
}
