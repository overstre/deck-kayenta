import metricStoreConfigStore from '../metricStoreConfig.service';
import OpentsdbConfigurer, { queryFinder } from './metricConfigurer';

metricStoreConfigStore.register({
  name: 'opentsdb',
  metricConfigurer: OpentsdbConfigurer,
  queryFinder,
});
