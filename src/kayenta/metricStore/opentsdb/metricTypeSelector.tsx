import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ICanaryState } from 'kayenta/reducers';
import { AsyncRequestState } from 'kayenta/reducers/asyncRequest';
import * as Creators from 'kayenta/actions/creators';
import { IOpentsdbMetricDescriptor } from './domain/IOpentsdbMetricDescriptor';
import { DISABLE_EDIT_CONFIG, DisableableReactTypeahead } from 'kayenta/layout/disableable';
import './typeahead.less';

interface IOpentsdbMetricTypeSelectorDispatchProps {
  load: (filter: string) => void;
}

interface IOpentsdbMetricTypeSelectorStateProps {
  options: string[];
  loading: boolean;
}

interface IOpentsdbMetricTypeSelectorOwnProps {
  value: string;
  onChange: (option: string[]) => void;
}

export const OpentsdbMetricTypeSelector = ({
  loading,
  load,
  options,
  value,
  onChange,
}: IOpentsdbMetricTypeSelectorDispatchProps &
  IOpentsdbMetricTypeSelectorStateProps &
  IOpentsdbMetricTypeSelectorOwnProps) => {
  options = options.concat(value);

  return (
    <DisableableReactTypeahead
      options={options}
      isLoading={loading}
      onChange={(option: string[]) => {
        onChange(option);
        load(option[0]);
      }}
      defaultInputValue={value}
      renderMenuItemChildren={option => (
        <a style={{ pointerEvents: 'all', textDecoration: 'none', color: '#000000' }}>{option}</a>
      )}
      placeholder={'Enter at least three characters to search.'}
      onInputChange={input => {
        onChange([input]);
        load(input);
        return input;
      }}
      disabledStateKeys={[DISABLE_EDIT_CONFIG]}
    />
  );
};

export const mapStateToProps = (state: ICanaryState, ownProps: IOpentsdbMetricTypeSelectorOwnProps) => {
  const descriptors = state.data.metricsServiceMetadata.data as IOpentsdbMetricDescriptor[];
  const options: string[] = descriptors.map(d => d.name);

  return {
    options: options,
    loading: state.data.metricsServiceMetadata.load === AsyncRequestState.Requesting,
    ...ownProps,
  };
};

export const mapDispatchToProps = (dispatch: Dispatch<ICanaryState>) => {
  return {
    load: (filter: string) => {
      dispatch(Creators.updateOpentsdbMetricDescriptorFilter({ filter }));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OpentsdbMetricTypeSelector);
