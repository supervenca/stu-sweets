export interface CakeConfigPayload {
  flavor: string[];
  color: string[];
  messageColor: string[];

  smallMultiplier?: number;
  mediumMultiplier?: number;
  largeMultiplier?: number;
}


export interface CakeConfig extends CakeConfigPayload {
  id: number;
  productId: number;
  flavor: string[];
  color: string[];
  messageColor: string[];
}