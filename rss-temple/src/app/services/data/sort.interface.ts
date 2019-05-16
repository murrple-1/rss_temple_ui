export interface Sort {
  // TODO small limitation to reexplore in the future: https://github.com/Microsoft/TypeScript/issues/11120
  [field: string]: 'ASC' | 'DESC';
}
