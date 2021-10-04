import React, {useEffect, useRef} from 'react';
import {change} from 'redux-form';
import {getFormValues} from "redux-form";

import _get from 'lodash/get';
import {useBem} from "../../../../../react/src/hooks";
import _upperFirst from "lodash-es/upperFirst";
import useDispatch from "@steroidsjs/core/src/hooks/useDispatch";
import {smartSearch} from '@steroidsjs/core/src/utils/text';
import {useSelector} from "../../../../../react/src/hooks";
import {getRouteParams} from '@steroidsjs/core/src/reducers/router';

import ClassType from '../../../enums/ClassType';

import {
    Form,
    Button,
    Field,
    FieldList,
    AutoCompleteField,
    CheckboxField,
} from '../../../../../react/src/ui/form';

import {Detail} from "../../../../../react/src/ui/content/Detail";

import './CrudCreatorView';

interface ICrudCreatorViewProps {
    entity?: {
        moduleId?: string,
        name?: string,
        className?: string,
    }
    initialValues?: any,
    appTypes?: {
        name?: string,
        title?: string,
        additionalFields?: {
            attribute?: string,
            component?: string,
            label?: string,
        }[],
    }[],
    classType?: string,
    onEntityComplete?: () => void,
    onSubmit?: () => void,
    classesByType?: any,
    formValues?: any,
    routeParams?: any,
    applications?: any[],
    dispatch?: () => any,
}

function CrudCreatorView (props: ICrudCreatorViewProps) {

    const dispatch = useDispatch()

    const getFormId = props => ['CrudCreatorView', props.entity.namespace, props.entity.name || ''].join('_');

    const {
        formValues,
        routeParams,
        applications,
    } = useSelector(state => ({
        formValues: getFormValues(getFormId(props))(state),
        routeParams: getRouteParams(state),
        applications: _get(state, 'auth.data.applications'),
    }));

    // Hook to get prepProps
    function usePrevious(props) {
        const prop = useRef();
        useEffect(() => {prop.current = props;}, [props]);
        return prop.current;
    }
    const prevProps = usePrevious(props)

    const componentDidUpdate = (prevProps) => React.useEffect(() => {
        if (
            _get(props.entity, 'queryModel') === _get(formValues, 'queryModel')
            && _get(prevProps.formValues, 'searchModel', null) === _get(formValues, 'searchModel', null)
        ) {
            return;
        }

        if (
            prevProps.formValues?.queryModel !== formValues?.queryModel
            || prevProps.formValues?.searchModel !== formValues?.searchModel
        ) {
            const attributes = findAttributesModel(applications, formValues.queryModel);
            if (attributes) {
                dispatch(change(getFormId(props), 'items', attributes))
            }
        }
    })

    componentDidUpdate(prevProps)

    const findAttributesModel = (items, className = '') => {
        if (!className || className.length === 0 || !items) {
            return null;
        }

        const tokens = className.split('\\');
        let firstToken = tokens.shift();

        if (!firstToken) {
            return null;
        }

        for (let route of items) {
            if (route.id) {
                const isExistRoute = route.id.toString().includes(firstToken);
                if (isExistRoute) {
                    if (_get(route, 'attributeItems')) {
                        return route.attributeItems;
                    } else {
                        return findAttributesModel(route.items, tokens.length !== 0 ? tokens.join('\\') : '');
                    }
                }
            }
        }
    }

    const initialValues = () => {
        if (!_get(props.initialValues, 'name')) {
            return {
                ...props.initialValues,
                createActionCreate: true,
                createActionUpdate: true,
                createActionDelete: true,
                createActionView: true,
                createActionUpdateBatch: true,
                createActionIndex: true,
            };
        }

        return props.initialValues;
    }

    const renderControlActions = () => {
        return (
            <>
                <h3 className='mt-4'>
                    {__('Control actions')}
                </h3>
                <div className='row mt-3'>
                    <div className='col-3'>
                        <CheckboxField
                            label='Create action create'
                            attribute='createActionCreate'
                        />
                        <CheckboxField
                            label='Create action update'
                            attribute='createActionUpdate'
                        />
                        <CheckboxField
                            label='create action delete'
                            attribute='createActionDelete'
                        />
                    </div>
                    <div className='col-3'>
                        <CheckboxField
                            label='Create action view'
                            attribute='createActionView'
                        />
                        <CheckboxField
                            label='Create action update-batch'
                            attribute='createActionUpdateBatch'
                        />
                        <CheckboxField
                            label='create action index'
                            attribute='createActionIndex'
                        />
                    </div>
                </div>
            </>
        )
    }

    const renderModelAttributesTable = () => {

        const bem = useBem('CrudCreatorView')

        if (formValues?.queryModel && !formValues?.searchModel) {
            return (
                <div>
                    <h3 className='mt-4'>
                        {__('Model attributes')}
                    </h3>
                    <FieldList
                        attribute='items'
                        model='steroids.gii.forms.BackendModelRelationEntity'
                        showAdd={false}
                        showRemove={false}
                        className={bem(bem.element('field-list'), 'my-2')}
                        initialRowsCount={0}
                        items={[
                            {
                                attribute: 'name',
                                disabled: true,
                                label: 'Name'
                            },
                            // {
                            //     attribute: 'label',
                            //     label: 'label'
                            // },
                            {
                                attribute: 'showInTable',
                                component: CheckboxField,
                                label: 'Show in table',
                                headerClassName: 'd-none',
                            },
                            {
                                attribute: 'showInForm',
                                component: CheckboxField,
                                label: 'Show in form',
                                headerClassName: 'd-none',
                            },
                            {
                                attribute: 'showInView',
                                component: CheckboxField,
                                label: 'Show in view',
                                headerClassName: 'd-none',
                            },
                            // {
                            //     attribute: 'isSortable',
                            //     component: CheckboxField,
                            //     label: 'Sortable',
                            //     headerClassName: 'd-none',
                            // },
                        ]}
                    />
                </div>
            )
        }

        return null;
    }

    const bem = useBem('CrudCreatorView')

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
                layout='default'
                size='sm'
                initialValues={initialValues()}
                onSubmit={props.onSubmit}
                autoFocus
            >
                <div className='row'>
                    <div className='col-3'>
                        <Field
                            disabled
                            attribute='moduleId'
                            placeholder='app\billing\BillingModule'
                            label='ModuleId'
                        />
                    </div>
                    <div className='col-3'>
                        <Field
                            attribute='name'
                            placeholder='UsersController'
                            label='Name'
                        />
                    </div>
                </div>
                <div className='w-50'>
                    <AutoCompleteField
                        attribute='queryModel'
                        placeholder='app\user\models\User'
                        label='Query model'
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
                <div className='w-50'>
                    <AutoCompleteField
                        attribute='searchModel'
                        placeholder='app\user\forms\UserSearch'
                        label='Search Model'
                        items={props.classesByType[ClassType.FORM]}
                        dataProvider={{
                            onSearch: (action, {query}) => {
                                const classes = props.classesByType[ClassType.FORM].map(className => ({
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
                <div className='w-50'>
                    <AutoCompleteField
                        attribute='viewSchema'
                        placeholder='app\user\forms\UserSchema'
                        label='View schema'
                        items={props.classesByType[ClassType.SCHEMA]}
                        dataProvider={{
                            onSearch: (action, {query}) => {
                                const classes = props.classesByType[ClassType.SCHEMA].map(className => ({
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

                {renderControlActions()}

                {renderModelAttributesTable()}

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

export default CrudCreatorView;
