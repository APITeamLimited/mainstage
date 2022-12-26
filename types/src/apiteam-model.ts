export type CreateMixin<CreateInput, ObjectType> = {
  create: (input: CreateInput) => Promise<ObjectType>
}

export type UpdateMixin<UpdateInput, ObjectType> = {
  update: (id: string, input: UpdateInput) => Promise<ObjectType>
}

export type DeleteMixin<ObjectType> = {
  delete: (id: string) => Promise<ObjectType>
}

export type RebuidCacheMixin = {
  rebuildCache?: () => Promise<void>
}

export type ExistsMixin = {
  exists: (id: string) => Promise<boolean>
}

export type GetMixin<ObjectType> = {
  get: (id: string) => Promise<ObjectType | null>
}

export type GetAllMixin<ObjectType> = {
  getAll: () => Promise<ObjectType[]>
}

export type GetAllAsyncIteratorMixin<ObjectType> = {
  getAllAsyncIterator: () => AsyncIterableIterator<ObjectType>
}

export type IndexedFieldMixin<
  ObjectType,
  IndexedKeys extends keyof ObjectType
> = {
  getIndexedField: (
    field: IndexedKeys,
    key: ObjectType[IndexedKeys]
  ) => Promise<ObjectType | null>
  indexedFieldExists: (
    field: IndexedKeys,
    key: ObjectType[IndexedKeys]
  ) => Promise<boolean>
}

export type APITeamModel<CreateInput, UpdateInput, ObjectType> = CreateMixin<
  CreateInput,
  ObjectType
> &
  UpdateMixin<UpdateInput, ObjectType> &
  DeleteMixin<ObjectType> &
  GetMixin<ObjectType> &
  RebuidCacheMixin &
  ExistsMixin
