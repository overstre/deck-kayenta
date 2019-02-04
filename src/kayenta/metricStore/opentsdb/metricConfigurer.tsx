import * as React from 'react';
import { Action } from 'redux';
import { connect } from 'react-redux';
import { get } from 'lodash';
import autoBindMethods from 'class-autobind-decorator';

import FormRow from 'kayenta/layout/formRow';
import { ICanaryState } from 'kayenta/reducers';
import * as Creators from 'kayenta/actions/creators';
import { DisableableInput, DISABLE_EDIT_CONFIG } from 'kayenta/layout/disableable';
import { ICanaryMetricConfig } from 'kayenta/domain';
import KeyValueList, { IKeyValuePair, IUpdateKeyValueListPayload } from '../../layout/keyValueList';

import './metricConfigurer.less';
import { ICanaryMetricValidationErrors, MetricValidatorFunction } from '../../edit/editMetricValidation';
import { createSelector } from 'reselect';
import { editingMetricSelector } from '../../selectors';
import OpentsdbMetricTypeSelector from './metricTypeSelector';

interface IOpentsdbMetricConfigurerStateProps {
  editingMetric: ICanaryMetricConfig;
  validationErrors: ICanaryMetricValidationErrors;
}

interface IOpentsdbMetricConfigurerDispatchProps {
  updateMetricName: (name: string) => void;
  updateAggregator: (method: string) => void;
  updateDownsample: (method: string) => void;    
  updateTagPairs: (payload: IUpdateKeyValueListPayload) => void;
}

type OpentsdbMetricConfigurerProps = IOpentsdbMetricConfigurerStateProps & IOpentsdbMetricConfigurerDispatchProps;

export const queryFinder = (metric: ICanaryMetricConfig) => get(metric, 'query.metricName', '');
const getOpentsdbMetric = queryFinder;
const getTagPairs = (metric: ICanaryMetricConfig) => get(metric, 'query.tagPairs', []) as IKeyValuePair[];
const getAggregator = (metric: ICanaryMetricConfig) => get(metric, 'query.aggregator', '');
const getDownsample = (metric: ICanaryMetricConfig) => get(metric, 'query.downsample', '');

@autoBindMethods
class OpentsdbMetricConfigurer extends React.Component<OpentsdbMetricConfigurerProps> {
  // public onMetricNameChange(e: React.ChangeEvent<HTMLInputElement>) {
  //   this.props.updateMetricName(e.target.value);
    // }

  public onMetricNameChange(name: string) {
      this.props.updateMetricName(name);
  }    

  public onAggregatorChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.props.updateAggregator(e.target.value);
  }

  public onDownsampleChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.props.updateDownsample(e.target.value);
  }

  public render() {
      const { editingMetric, updateTagPairs, validationErrors } = this.props;

    return (
      <section>
        <FormRow label="OpenTSDB Metric" error={get(validationErrors, 'opentsdbMetric.message', null)}>
            <OpentsdbMetricTypeSelector
            value={getOpentsdbMetric(editingMetric)}
            // onChange={this.onMetricNameChange}
            onChange={(option: string[]) => {
                     this.onMetricNameChange(option[0]);
            }}
            />
        </FormRow>

        <FormRow label="Aggregator" helpId="canary.config.opentsdb.aggregator"
                 error={get(validationErrors, 'aggregator.message', null)}>
          <DisableableInput
            type="text"
            value={getAggregator(editingMetric)}
            onChange={this.onAggregatorChange}
            disabledStateKeys={[DISABLE_EDIT_CONFIG]}
          />
        </FormRow>

        <FormRow label="Downsample" helpId="canary.config.opentsdb.downsample">
          <DisableableInput
            type="text"
            value={getDownsample(editingMetric)}
            onChange={this.onDownsampleChange}
            disabledStateKeys={[DISABLE_EDIT_CONFIG]}
          />
        </FormRow>                        
            
        <FormRow label="Tags" helpId="canary.config.opentsdb.tagPairs"
                 error={get(validationErrors, 'tagPairs.message', null)}>
          <KeyValueList
            className="signalfx-query-pairs"
            list={getTagPairs(editingMetric)}
            actionCreator={updateTagPairs}
          />
        </FormRow>
      </section>
    );
  }
}

/**
 * Validates Opentsdb specific fields on the edit metric modal
 */
export function validateMetric(editingMetric: ICanaryMetricConfig): ICanaryMetricValidationErrors {
  const errors: ICanaryMetricValidationErrors = {};

  const validators: MetricValidatorFunction[] = [...getOpentsdbValidators(editingMetric)];

  return validators.reduce((reducedErrors, validator) => validator(reducedErrors, editingMetric), errors);
}

/**
 * returns the list of validators for the Opentsdb edit metric form.
 */
export function getOpentsdbValidators(editingMetric: ICanaryMetricConfig): MetricValidatorFunction[] {
  if (!editingMetric || !editingMetric.query) {
    return [];
  }
  return [validateOpentsdbMetricName, validateAggregator, validateTagPairs];
}

/**
 * Validates that the user has supplied a Opentsdb metric.
 */
function validateOpentsdbMetricName(
  errors: ICanaryMetricValidationErrors,
  editingMetric: ICanaryMetricConfig,
): ICanaryMetricValidationErrors {
  const nextErrors = { ...errors };

  const opentsdbMetric = getOpentsdbMetric(editingMetric);

  if (!opentsdbMetric) {
    nextErrors.opentsdbMetric = { message: 'The OpenTSDB metric is required.' };
  }

  return nextErrors;
}

/**
 * Validates that the user has supplied an aggregator.
 */
function validateAggregator(
  errors: ICanaryMetricValidationErrors,
  editingMetric: ICanaryMetricConfig,
): ICanaryMetricValidationErrors {
  const nextErrors = { ...errors };

  const aggregator = getAggregator(editingMetric);

  if (!aggregator) {
    nextErrors.aggregator = { message: 'The OpenTSDB aggregator is required.' };
  }

  return nextErrors;
}

/**
 * Validates that if the user has supplied query pairs that all key value combos contain values.
 */
function validateTagPairs(
  errors: ICanaryMetricValidationErrors,
  editingMetric: ICanaryMetricConfig,
): ICanaryMetricValidationErrors {
  const nextErrors = { ...errors };

  const tagPairs: IKeyValuePair[] = getTagPairs(editingMetric);

  tagPairs.forEach(qp => {
    if (!qp.key || !qp.value) {
      nextErrors.tagPairs = { message: 'All tags must contain a non-blank key and value.' };
    }
  });

  return nextErrors;
}

const sfxEditingMetricValidationErrorsSelector = createSelector(editingMetricSelector, validateMetric);

function mapStateToProps(state: ICanaryState): IOpentsdbMetricConfigurerStateProps {
  return {
    editingMetric: state.selectedConfig.editingMetric,
    validationErrors: sfxEditingMetricValidationErrorsSelector(state),
  };
}

function mapDispatchToProps(dispatch: (action: Action & any) => void): IOpentsdbMetricConfigurerDispatchProps {
  return {
    updateMetricName: (metricName: string): void => {
      dispatch(Creators.updateOpentsdbMetricName({ metricName }));
    },
    updateAggregator: (aggregator: string): void => {
      dispatch(Creators.updateOpentsdbAggregator({ aggregator }));
    },
    updateDownsample: (downsample: string): void => {
      dispatch(Creators.updateOpentsdbDownsample({ downsample }));
    },      
    updateTagPairs: payload => dispatch(Creators.updateOpentsdbTagPairs(payload)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OpentsdbMetricConfigurer);
