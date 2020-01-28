import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {getFormValues, change} from 'redux-form';
import {Form, AutoCompleteField, Button, Field, DropDownField, FieldList} from '@steroidsjs/core/ui/form';
import _get from 'lodash/get';
import _some from 'lodash/some';
import {bem} from '@steroidsjs/core/hoc';

import ClassType from 'enums/ClassType';
import ModelAttributeRow from './ModelAttributeRow';
import ModelRelationRow from './ModelRelationRow';

import './ModelView.scss';
import InputField from '../../../../../react/ui/form/InputField';

const FORM_ID = 'ModelView';

@connect(
    state => ({
        formValues: getFormValues(FORM_ID)(state),
    })
)
@bem('ModelView')
export default class ModelView extends React.PureComponent {

    static propTypes = {
        entity: PropTypes.shape({
            namespace: PropTypes.string,
            name: PropTypes.string,
            className: PropTypes.string,
        }),
        initialValues: PropTypes.object,
        types: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            title: PropTypes.string,
            additionalFields: PropTypes.arrayOf(PropTypes.shape({
                attribute: PropTypes.string,
                component: PropTypes.string,
                label: PropTypes.string,
            })),
        })),
        classType: PropTypes.string,
        onSubmit: PropTypes.func,
        classesByType: PropTypes.object,
        sampleAttributes: PropTypes.arrayOf(PropTypes.shape({
            appType: PropTypes.string,
            name: PropTypes.string,
            defaultValue: PropTypes.string,
            example: PropTypes.string,
            hint: PropTypes.string,
            label: PropTypes.string,
        })),
        formValues: PropTypes.object,
    };

    render() {
        const bem = this.props.bem;
        return (
            <div className={bem.block()}>
                <Form
                    formId={FORM_ID}
                    model='steroids.gii.forms.ModelEntity'
                    layout='default'
                    size='sm'
                    initialValues={this.props.initialValues}
                    onSubmit={this.props.onSubmit}
                >
                    <div className='row'>
                        <div className='col-3'>
                            <Field
                                attribute='namespace'
                                component={InputField}
                            />
                        </div>
                        <div className='col-4'>
                            <Field attribute='name'/>
                        </div>
                        {this.props.classType === ClassType.MODEL && (
                            <div className='col-4'>
                                <Field attribute='tableName'/>
                            </div>
                        )}
                    </div>
                    {this.props.classType === ClassType.FORM && (
                        <div className='row'>
                            <div className='col-4'>
                                <AutoCompleteField
                                    attribute='queryModel'
                                    items={this.props.classesByType[ClassType.MODEL]}
                                />
                            </div>
                        </div>
                    )}
                    <h3 className='mt-4'>
                        Attributes
                    </h3>
                    <FieldList
                        attribute='attributeItems'
                        model='steroids.gii.forms.ModelAttributeEntity'
                        itemView={ModelAttributeRow}
                        types={this.props.types}
                        className={bem(bem.element('field-list'), 'my-2')}
                        items={[
                            {
                                attribute: 'name',
                                placeholder: 'Attribute',
                                className: bem.element('input-attribute'),
                                firstLine: true,
                                component: AutoCompleteField,
                                items: this.props.sampleAttributes,
                                onSelect: (item, params) => {
                                    const hasFilled = _some(Object.keys(item.params), key => !!_get(this.props.formValues, params.prefix + '.' + key));
                                    if (!hasFilled) {
                                        this.props.dispatch(Object.keys(item.params).map(key => {
                                            return change(FORM_ID, params.prefix + '.' + key, item.params[key]);
                                        }));
                                    }
                                },
                            },
                            {
                                attribute: 'label',
                                label: 'Label / Hint',
                                placeholder: 'Label',
                                className: bem.element('input-label'),
                                firstLine: true,
                            },
                            {
                                attribute: 'hint',
                                placeholder: 'Hint',
                                className: bem.element('input-hint'),
                                headerClassName: 'd-none',
                            },
                            {
                                attribute: 'example',
                                placeholder: 'Example value',
                                className: bem.element('input-example-value'),
                                headerClassName: 'd-none',
                            },
                            {
                                attribute: 'defaultValue',
                                label: 'Default / Example',
                                placeholder: 'Default value',
                                className: bem.element('input-default-value'),
                                firstLine: true,
                            },
                            {
                                attribute: 'appType',
                                firstLine: true,
                                className: bem.element('input-app-type'),
                                component: AutoCompleteField,
                                items: this.props.types.map(item => item.name),
                            },
                            {
                                attribute: 'isRequired',
                                firstLine: true,
                                headerClassName: 'd-none',
                            },
                            {
                                attribute: 'isSortable',
                                firstLine: true,
                                headerClassName: 'd-none',
                                visible: this.props.classType === ClassType.FORM,
                            },
                            {
                                attribute: 'isPublishToFrontend',
                                firstLine: true,
                                headerClassName: 'd-none',
                                visible: this.props.classType === ClassType.MODEL,
                            },
                        ]}
                    />
                    <div>
                        <h3 className='mt-4'>
                            Relations
                        </h3>
                        <FieldList
                            attribute='relationItems'
                            model='steroids.gii.forms.ModelRelationEntity'
                            itemView={ModelRelationRow}
                            className={bem(bem.element('field-list'), 'my-2')}
                            initialRowsCount={0}
                            items={[
                                {
                                    attribute: 'type',
                                    component: DropDownField,
                                    items: 'steroids.gii.enums.RelationType',
                                },
                                {
                                    attribute: 'name',
                                },
                                {
                                    attribute: 'relationModel',
                                    items: this.props.classesByType[ClassType.MODEL],
                                    component: AutoCompleteField,
                                },
                                {
                                    attribute: 'relationKey',
                                },
                                {
                                    attribute: 'selfKey',
                                },
                                {
                                    attribute: 'viaTable',
                                    placeholder: 'Junction table',
                                    headerClassName: 'd-none',
                                    isVia: true,
                                },
                                {
                                    attribute: 'viaRelationKey',
                                    placeholder: 'Relation key',
                                    headerClassName: 'd-none',
                                    isVia: true,
                                },
                                {
                                    attribute: 'viaSelfKey',
                                    placeholder: 'Self key',
                                    headerClassName: 'd-none',
                                    isVia: true,
                                },
                            ]}
                        />
                    </div>
                    <div className='mt-4 row'>
                        <div className='col-md-3'>
                            <Field
                                attribute='migrateMode'
                                items='steroids.gii.enums.MigrateMode'
                            />
                        </div>
                    </div>
                    <div className='mb-5'>
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
