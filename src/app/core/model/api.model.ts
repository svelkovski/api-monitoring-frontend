export interface Api {
  id: number;
  name: string;
  url: string;
  method: string;
  status: string;
  responseTime: number | null;
  responseCode: number;
  checkedAt: string;
}
