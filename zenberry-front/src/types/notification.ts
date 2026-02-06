export interface Notification {
  id: string;
  type: "order" | "promotion" | "stock" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}
