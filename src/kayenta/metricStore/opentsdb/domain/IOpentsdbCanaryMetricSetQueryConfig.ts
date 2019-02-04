import { ICanaryMetricSetQueryConfig } from 'kayenta/domain';

export interface IOpentsdbCanaryMetricSetQueryConfig extends ICanaryMetricSetQueryConfig {
  metricName: string;
  aggregator: string;
  downsample: string;    
  tagPairs: [{ key: string; value: string }];
}
