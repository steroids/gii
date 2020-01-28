import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {formValueSelector} from 'redux-form';
import _get from 'lodash-es/get';
import _upperFirst from 'lodash-es/upperFirst';
import {Form, Button, Field, InputField, CheckboxField, FieldList} from '@steroidsjs/core/ui/form';
import {bem} from '@steroidsjs/core/hoc';

import './EnumView.scss';

const FORM_ID = 'EnumCreatorView';

@connect(
    state => {
        const values = formValueSelector(FORM_ID)(state, 'isCustomValues', 'items');
        return {
            isCustomValues: !!values.isCustomValues,
            hasEnumValues: !!(values.items || []).find(item => item && item.value),
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
        initialValues: PropTypes.object,
        isCustomValues: PropTypes.bool,
        hasEnumValues: PropTypes.bool,
        onSubmit: PropTypes.func,
    };

    render() {
        const bem = this.props.bem;
        return (
            <div className={bem.block()}>
                <Form
                    formId={FORM_ID}
                    action='/api/gii/class-save'
                    model='steroids.gii.forms.EnumEntity'
                    layout='default'
                    size='sm'
                    initialValues={this.props.initialValues}
                    onSubmit={this.props.onSubmit}
                >
                    <div className='row'>
                        <div className='col-3'>
                            <Field attribute='namespace'/>
                        </div>
                        <div className='col-4'>
                            <Field attribute='name'/>
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
                        model='steroids.gii.forms.EnumItemEntity'
                        className={bem(bem.element('field-list'), 'my-2')}
                        items={[]
                            .concat([
                                {
                                    attribute: 'name',
                                    className: bem.element('input-attribute'),
                                },
                                {
                                    attribute: 'value',
                                    visible: this.props.isCustomValues || this.props.hasEnumValues,
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
