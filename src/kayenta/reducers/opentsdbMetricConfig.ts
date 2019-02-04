import { Action } from 'redux';
import { handleActions } from 'redux-actions';

import * as Actions from 'kayenta/actions';
import { IUpdateKeyValueListPayload, updateListReducer } from '../layout/keyValueList';
import { IOpentsdbCanaryMetricSetQueryConfig } from 'kayenta/metricStore/opentsdb/domain/IOpentsdbCanaryMetricSetQueryConfig';
import { IKayentaAction } from '../actions/creators';
import { ICanaryMetricConfig } from '../domain';

const updateTagPairsReducer = updateListReducer();

type IOpentsdbMetricConfig = ICanaryMetricConfig<IOpentsdbCanaryMetricSetQueryConfig>;

export const opentsdbMetricConfigReducer = handleActions(
  {
    [Actions.UPDATE_OPENTSDB_TAG_PAIRS]: (
      state: IOpentsdbMetricConfig,
      action: IKayentaAction<IUpdateKeyValueListPayload>,
    ) => ({
      ...state,
      query: {
        ...state.query,
        tagPairs: updateTagPairsReducer(state.query.tagPairs || [], action),
      },
    }),
    [Actions.UPDATE_OPENTSDB_AGGREGATOR]: (state: IOpentsdbMetricConfig, action: Action & any) => ({
      ...state,
      query: { ...state.query, aggregator: action.payload.aggregator },
    }),
    [Actions.UPDATE_OPENTSDB_DOWNSAMPLE]: (state: IOpentsdbMetricConfig, action: Action & any) => ({
      ...state,
      query: { ...state.query, downsample: action.payload.downsample },
    }),      
  },
  null,
);
