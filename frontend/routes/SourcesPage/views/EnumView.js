import React from 'react';
import PropTypes from 'prop-types';
import {getFormValues} from 'redux-form';
import _get from 'lodash-es/get';
import _upperFirst from 'lodash-es/upperFirst';
import {Form, Button, Field, InputField, CheckboxField, FieldList} from '@steroidsjs/core/ui/form';
import Detail from '@steroidsjs/core/ui/list/Detail';
import {bem, connect} from '@steroidsjs/core/hoc';

import './EnumView.scss';

const getFormId = props => ['EnumView', props.entity.namespace, props.entity.name || ''].join('_');

@connect(
    (state, props) => {
        const formValues = getFormValues(getFormId(props))(state);
        return {
            formValues,
            hasEnumValues: !!(_get(formValues, 'items') || []).find(item => item && item.value),
        };
    }
)
@bem('EnumView')
export default class EnumView extends React.PureComponent {

    static propTypes = {
        entity: PropTypes.shape({
            namespace: PropTypes.string,
            name: PropTypes.string,
            className: PropTypes.string,
        }),
        formValues: PropTypes.shape({
            namespace: PropTypes.string,
            name: PropTypes.string,
            isCustomValues: PropTypes.bool,
        }),
        initialValues: PropTypes.object,
        hasEnumValues: PropTypes.bool,
        onSubmit: PropTypes.func,
    };

    render() {
        const bem = this.props.bem;
        return (
            <div className={bem.block()}>
                {this.props.formValues && (
                    <Detail
                        model='steroids.gii.forms.BackendEnumEntity'
                        item={{
                            name: this.props.formValues.namespace + '\\' + _upperFirst(this.props.formValues.name || '...'),
                        }}
                        attributes={[
                            'name',
                        ]}
                    />
                )}
                <Form
                    formId={getFormId(this.props)}
                    model='steroids.gii.forms.BackendEnumEntity'
                    layout='default'
                    size='sm'
                    initialValues={this.props.initialValues}
                    onSubmit={this.props.onSubmit}
                    autoFocus
                >
                    <div className='row'>
                        <div className='col-4'>
                            <Field attribute='name'/>
                        </div>
                        <div className='col-6'>
                            <Field attribute='namespace'/>
                        </div>
                    </div>
                    <div className='mt-2'>
                        <CheckboxField
                            attribute='isCustomValues'
                            label='Show Enum values'
                            disabled={this.props.hasEnumValues}
                        />
                    </div>
                    <h3 className='mt-4'>
                        Items
                    </h3>
                    <FieldList
                        attribute='items'
                        model='steroids.gii.forms.BackendEnumItemEntity'
                        className={bem(bem.element('field-list'), 'my-2')}
                        items={[]
                            .concat([
                                {
                                    attribute: 'name',
                                    className: bem.element('input-attribute'),
                                },
                                {
                                    attribute: 'value',
                                    visible: _get(this.props, 'formValues.isCustomValues') || this.props.hasEnumValues,
                                },
                                {
                                    attribute: 'label',
                                },
                                {
                                    attribute: 'cssClass',
                                },
                            ])
                            .concat(_get(this.props.entity, 'customColumns', []).map(attribute => ({
                                attribute: 'custom.' + attribute,
                                label: _upperFirst(attribute),
                                component: InputField,
                            })))
                        }
                    />
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
