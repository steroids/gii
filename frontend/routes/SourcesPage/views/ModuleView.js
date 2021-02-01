import React from 'react';
import PropTypes from 'prop-types';
import {Form, Button, Field} from '@steroidsjs/core/ui/form';
import {bem, connect} from '@steroidsjs/core/hoc';
import _get from 'lodash/get';
import _upperFirst from 'lodash/upperFirst';
import _lowerFirst from 'lodash/lowerFirst';

import './ModuleView.scss';
import {getFormValues} from 'redux-form';
import Detail from '../../../../../react/ui/list/Detail';

const getFormId = props => ['ModuleView', props.entity.id || ''].join('_');

@connect(
    (state, props) => ({
        formValues: getFormValues(getFormId(props))(state),
    })
)
@bem('ModuleView')
export default class ModuleView extends React.PureComponent {

    static propTypes = {
        entity: PropTypes.shape({
            id: PropTypes.string,
        }),
        initialValues: PropTypes.object,
        onSubmit: PropTypes.func,
    };

    render() {
        const moduleIds = (_get(this.props, 'formValues.id') || '').split('.').map(moduleId => _lowerFirst(moduleId).replace(/Module$/, ''));
        const bem = this.props.bem;
        return (
            <div className={bem.block()}>
                {this.props.formValues && (
                    <Detail
                        model='steroids.gii.forms.BackendModelEntity'
                        item={{
                            className: [
                                'app',
                                ...moduleIds,
                                moduleIds.length > 0
                                    ? _upperFirst(moduleIds[moduleIds.length - 1]) + 'Module'
                                    : null,
                            ].filter(Boolean).join('\\'),
                        }}
                        attributes={[
                            {
                                attribute: 'className',
                                label: 'Class name',
                            },
                        ]}
                    />
                )}
                <Form
                    formId={getFormId(this.props)}
                    model='steroids.gii.forms.BackendModuleEntity'
                    layout='default'
                    size='sm'
                    initialValues={this.props.initialValues}
                    onSubmit={this.props.onSubmit}
                    autoFocus
                >
                    <div className='row'>
                        <div className='col-3'>
                            <Field attribute='id'/>
                        </div>
                    </div>
                    <div className='mt-4 mb-5'>
                        <Button
                            type='submit'
                            label='Save'
                        />
                    </div>
                </Form>
            </div>
        );
    }

}
