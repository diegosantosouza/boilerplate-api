export interface ExampleSyncResource {
  id: string;
  payload: Record<string, unknown>;
}

export interface ExampleSyncMessage {
  action: 'sync';
  data: ExampleSyncResource;
}
