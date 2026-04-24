export type Primitive = string | number | boolean | null;
export type JsonValue = Primitive | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue | undefined;
}
export type JsonArray = JsonValue[];

export type Cart = JsonObject & {
  products?: JsonObject[];
};

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
