import React from 'react';
import PropTypes from 'prop-types';
import {getFormValues, change} from 'redux-form';
import {getRouteParams} from '@steroidsjs/core/reducers/router';
import {Form, AutoCompleteField, Button, Field, DropDownField, FieldList} from '@steroidsjs/core/ui/form';
import _get from 'lodash/get';
import {bem, connect} from '@steroidsjs/core/hoc';
import _upperFirst from 'lodash-es/upperFirst';

import ClassType from 'enums/ClassType';
import MigrateMode from 'enums/MigrateMode';
import ModelAttributeRow from './ModelAttributeRow';
import ModelRelationRow from './ModelRelationRow';

import './ModelView.scss';
import Detail from '@steroidsjs/core/ui/list/Detail';
import {smartSearch} from '@steroidsjs/core/utils/text';

const getFormId = props => ['ModelView', props.entity.namespace, props.entity.name || ''].join('_');

@connect(
    (state, props) => ({
        formValues: getFormValues(getFormId(props))(state),
        routeParams: getRouteParams(state),
    })
)
@bem('ModelView')
export default class ModelView extends React.PureComponent {

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (_get(this.props.formValues, 'namespace') && _get(this.props.routeParams, 'namespace')) {
            const formNamespace = this.props.formValues.namespace.split('\\');
            // in url namespace look like `app%5Cuser%5Cmodels`
            const routeNamespace = this.props.routeParams.namespace.split('%5C');

            if (formNamespace.length >= 2 && routeNamespace.length >= 2) {
                const formModuleId = [formNamespace[0], formNamespace[1]].join('\\');
                const routeModuleId = [routeNamespace[0], routeNamespace[1]].join('\\');

                // compare module id both routes if they different that mean page has been updated
                if (formModuleId !== routeModuleId) {
                    // change namespace in redux-form
                    this.props.dispatch(change(getFormId(this.props), 'namespace', routeNamespace.join('\\')));
                }
            }
        }
    }

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
        routeParams: PropTypes.object,
    };

    render() {
        const bem = this.props.bem;
        let migrateMode = MigrateMode.NONE;
        if (this.props.classType === ClassType.MODEL) {
            migrateMode = this.props.initialValues?.tableName ? MigrateMode.UPDATE : MigrateMode.CREATE;
        }
        return (
            <div className={bem.block()}>
                {this.props.formValues && (
                    <Detail
                        model='steroids.gii.forms.BackendModelEntity'
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
                    model='steroids.gii.forms.BackendModelEntity'
                    layout='default'
                    size='sm'
                    initialValues={{
                        ...this.props.initialValues,
                        migrateMode
                    }}
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
                                    dataProvider={{
                                        onSearch: (action, {query}) => {
                                            const classes = this.props.classesByType[ClassType.MODEL].map(className => ({
                                                id: className,
                                                label: className
                                            }));
                                            // remove backslash at beginning query
                                            const normalizedQuery = query.replace(/^\\+/g, '');
                                            return smartSearch(normalizedQuery, classes);
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    <h3 className='mt-4'>
                        Attributes
                    </h3>
                    <FieldList
                        attribute='attributeItems'
                        model='steroids.gii.forms.BackendModelAttributeEntity'
                        itemView={ModelAttributeRow}
                        types={this.props.types}
                        className={bem(bem.element('field-list'), 'my-2')}
                        initialRowsCount={1}
                        items={[
                            {
                                attribute: 'name',
                                placeholder: 'Attribute',
                                className: bem.element('input-attribute'),
                                firstLine: true,
                                component: AutoCompleteField,
                                items: this.props.sampleAttributes,
                                onSelect: (item, params) => {
                                    this.props.dispatch(Object.keys(item.params).map(key => {
                                        return change(getFormId(this.props), params.prefix + '.' + key, item.params[key]);
                                    }));
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
                            model='steroids.gii.forms.BackendModelRelationEntity'
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
                                    dataProvider: {
                                        onSearch: (action, {query}) => {
                                            const classes = this.props.classesByType[ClassType.MODEL].map(className => ({
                                                id: className,
                                                label: className
                                            }));
                                            // remove backslash at beginning query
                                            const normalizedQuery = query.replace(/^\\+/g, '');
                                            return smartSearch(normalizedQuery, classes);
                                        },
                                    }
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
                            <Field attribute='migrateMode'/>
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
