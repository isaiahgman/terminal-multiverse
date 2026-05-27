export interface Module {
  name: string;
  description: string;
  run(): Promise<void>;
}
