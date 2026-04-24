export type Primitive = string | number | boolean | null;
export type JsonValue = Primitive | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue | undefined;
}
export interface JsonArray extends Array<JsonValue> { }

export interface CartProduct extends JsonObject { }
export interface Cart extends JsonObject {
  products?: CartProduct[];
}

export type ComparisonOperator = 'gt' | 'lt' | 'gte' | 'lte';
export type OperatorCondition = Partial<Record<ComparisonOperator, Primitive>> & {
  in?: Primitive[];
};

export type CriteriaCondition =
  | Primitive
  | OperatorCondition
  | { and: OperatorCondition }
  | { or: OperatorCondition };

export type Criteria = Record<string, CriteriaCondition>;
