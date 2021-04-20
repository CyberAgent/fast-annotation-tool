export const userAnnotSetCompareDescFn = (a, b): number =>
  b.userAnnotation.order_index - a.userAnnotation.order_index;
export const userAnnotSetCompareAscFn = (a, b): number =>
  a.userAnnotation.order_index - b.userAnnotation.order_index;
export const createdAtDescFn = (a, b): number =>
  a.created_at < b.created_at ? 1 : -1;
