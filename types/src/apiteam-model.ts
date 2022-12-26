export interface APITeamModel<CreateInput, UpdateInput, ObjectType> {
  create: (input: CreateInput) => Promise<ObjectType>
  update: (id: string, input: UpdateInput) => Promise<ObjectType>
  delete: (id: string) => Promise<ObjectType>
  get: (id: string) => Promise<ObjectType | null>
  getAll: () => Promise<ObjectType[]>
  rebuildCache: () => Promise<void>
}
