import { Logger } from '../logger'

// Deprecated
export interface Opts {
  devMode: boolean
  debug: boolean
  logger: Logger
}

export interface Service {
  format: ({
    service,
    region,
    account,
  }: {
    service: any
    region: string
    account: string
  }) => any
  getConnections?: ({
    service,
    region,
    account,
    data,
  }: {
    service: any
    region: string
    account: string
    data: any
  }) => any
  mutation: string
  getData: ({
    regions,
    config,
    opts,
    rawData,
  }: {
    regions: string
    config: any
    opts: Opts
    rawData: any
  }) => any
}

export interface ServiceConnection {
  id: string
  resourceType: string
  relation: string
  field: string
}

export interface Entity {
  name: string
  mutation: string
  data: any[]
}

export interface ProviderData {
  entities: Entity[]
  connections: { [key: string]: ServiceConnection[] }
}
