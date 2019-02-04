import { IMetricsServiceMetadata } from 'kayenta/domain';

export interface IOpentsdbMetricDescriptor extends IMetricsServiceMetadata {
  name: string;
}
