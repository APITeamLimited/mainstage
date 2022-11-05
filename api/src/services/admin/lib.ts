export type PaginationOptions = {
  page: number
  perPage: number
}

export type SortOptions = {
  field: string
  order: string
}

export type FilterType = Record<string, any>

export type MetaType = Record<string, any>

export type GetListInput = {
  pagination: PaginationOptions
  sort?: SortOptions
  filter?: FilterType
  meta?: MetaType
}

export type GetOneInput = {
  id: string
  meta?: MetaType
}

export type GetManyInput = {
  ids: string[]
  meta?: MetaType
}

export type GetManyReferenceInput = {
  target: string
  id: string
  pagination: PaginationOptions
  sort?: SortOptions
  filter?: FilterType
  meta?: MetaType
}

export type CreateInput<DataType> = {
  data: DataType
  meta?: MetaType
}

export type UpdateInput<DataType> = {
  id: string
  data: DataType
  previousData?: DataType
  meta?: MetaType
}

export type UpdateManyInput<DataType> = {
  ids: string[]
  data: DataType
  meta?: MetaType
}

export type DeleteInput = {
  id: string
  meta?: MetaType
}

export type DeleteManyInput = {
  ids: string[]
  meta?: MetaType
}
