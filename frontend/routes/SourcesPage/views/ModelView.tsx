import React, {useEffect} from 'react';
import _get from 'lodash/get';
import _upperFirst from 'lodash-es/upperFirst';
import {getFormValues, change} from 'redux-form';
import useDispatch from "@steroidsjs/core/src/hooks/useDispatch";
import {smartSearch} from '@steroidsjs/core/src/utils/text';
import {getRouteParams} from '@steroidsjs/core/src/reducers/router';
import {useBem, useSelector} from "@steroidsjs/core/src/hooks";

import ClassType from '../../../enums/ClassType';
import MigrateMode from '../../../enums/MigrateMode';
import ModelRelationRow from './ModelRelationRow';
import ModelAttributeRow from './ModelAttributeRow';
import {Detail} from "@steroidsjs/core/src/ui/content/Detail";

import {
    Form,
    Field,
    Button,
    FieldList,
    DropDownField,
    AutoCompleteField
} from '@steroidsjs/core/src/ui/form';

import './ModelView.scss';

interface IModelViewProps {
    entity?: {
        namespace?: string,
        name?: string,
        className?: string,
    },
    initialValues?: any,
    types?: {
        name?: string,
        title?: string,
        additionalFields?: {
            attribute?: string,
            component?: string,
            label?: string,
        }[],
    }[],
    classType?: string,
    onSubmit?: (any) => any,
    classesByType?: any,
    sampleAttributes?: {
        appType?: string,
        name?: string,
        defaultValue?: string,
        example?: string,
        hint?: string,
        label?: string,
    }[],
    formValues?: any,
    routeParams?: any,
}

export default function ModelView (props: IModelViewProps) {

    const getFormId = props => ['ModelView', props.entity.namespace, props.entity.name || ''].join('_');

    const dispatch = useDispatch()

    const {formValues, routeParams} = useSelector(state => {
        return {
            formValues: getFormValues(getFormId(props))(state),
            routeParams: getRouteParams(state),
        }
    })

    useEffect(() => {
        if (_get(formValues, 'namespace') && _get(routeParams, 'namespace')) {
            const formNamespace = formValues.namespace.split('\\');
            // in url namespace look like `app%5Cuser%5Cmodels`
            const routeNamespace = routeParams.namespace.split('%5C');

            if (formNamespace.length >= 2 && routeNamespace.length >= 2) {
                const formModuleId = [formNamespace[0], formNamespace[1]].join('\\');
                const routeModuleId = [routeNamespace[0], routeNamespace[1]].join('\\');

                // compare module id both routes if they different that mean page has been updated
                if (formModuleId !== routeModuleId) {
                    // change namespace in redux-form
                    dispatch(change(getFormId(props), 'namespace', routeNamespace.join('\\')));
                }
            }
        }
    })

    let migrateMode = MigrateMode.NONE;
    if (props.classType === ClassType.MODEL) {
        migrateMode = props.initialValues?.tableName ? MigrateMode.UPDATE : MigrateMode.CREATE;
    }

    const bem = useBem('ModelView')
    return (
        <div className={bem.block()}>
            {formValues && (
                <Detail
                    model='steroids.gii.forms.BackendModelEntity'
                    item={{
                        name: formValues.namespace + '\\' + _upperFirst(formValues.name || '...'),
                    }}
                    attributes={[
                        'name',
                    ]}
                />
            )}
            <Form
                formId={getFormId(props)}
                model='steroids.gii.forms.BackendModelEntity'
                layout='default'
                size='sm'
                initialValues={{
                    ...props.initialValues,
                    migrateMode
                }}
                onSubmit={props.onSubmit}
                autoFocus
            >
                <div className='row'>
                    <div className='col-4'>
                        <Field attribute='name'/>
                    </div>
                    <div className='col-6'>
                        <Field attribute='namespace'/>
                    </div>
                    {props.classType === ClassType.MODEL && (
                        <div className='col-4'>
                            <Field attribute='tableName'/>
                        </div>
                    )}
                </div>
                {props.classType === ClassType.FORM && (
                    <div className='row'>
                        <div className='col-4'>
                            <AutoCompleteField
                                attribute='queryModel'
                                items={props.classesByType[ClassType.MODEL]}
                                dataProvider={{
                                    onSearch: (action, {query}) => {
                                        const classes = props.classesByType[ClassType.MODEL].map(className => ({
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
                    types={props.types}
                    className={bem(bem.element('field-list'), 'my-2')}
                    initialRowsCount={1}
                    items={[
                        {
                            attribute: 'name',
                            placeholder: 'Attribute',
                            className: bem.element('input-attribute'),
                            firstLine: true,
                            component: AutoCompleteField,
                            items: props.sampleAttributes,
                            onSelect: (item, params) => {
                                dispatch(Object.keys(item.params).map(key => {
                                    return change(getFormId(props), params.prefix + '.' + key, item.params[key]);
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
                            items: props.types.map(item => item.name),
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
                            visible: props.classType === ClassType.FORM,
                        },
                        {
                            attribute: 'isPublishToFrontend',
                            firstLine: true,
                            headerClassName: 'd-none',
                            visible: props.classType === ClassType.MODEL,
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
                                items: props.classesByType[ClassType.MODEL],
                                component: AutoCompleteField,
                                dataProvider: {
                                    onSearch: (action, {query}) => {
                                        const classes = props.classesByType[ClassType.MODEL].map(className => ({
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
