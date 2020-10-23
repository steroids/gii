import React from 'react';
import PropTypes from 'prop-types';
import {
    Form,
    Button,
    Field,
    FieldList,
    AutoCompleteField,
    CheckboxField,
} from '@steroidsjs/core/ui/form';

import './CrudCreatorView.scss';
import {bem, connect} from '@steroidsjs/core/hoc';
import {getRouteParams} from '@steroidsjs/core/reducers/router';
import ClassType from '../../../enums/ClassType';
import _get from 'lodash/get';
import {smartSearch} from '@steroidsjs/core/utils/text';
import _upperFirst from "lodash-es/upperFirst";
import {getFormValues} from "redux-form";
import Detail from "@steroidsjs/core/ui/list/Detail";
import {change} from 'redux-form';

const getFormId = props => ['CrudCreatorView', props.entity.namespace, props.entity.name || ''].join('_');

@connect(
    (state, props) => ({
        formValues: getFormValues(getFormId(props))(state),
        routeParams: getRouteParams(state),
        applications: _get(state, 'auth.data.applications'),
    })
)
@bem('CrudCreatorView')
export default class CrudCreatorView extends React.PureComponent {

    static propTypes = {
        entity: PropTypes.shape({
            moduleId: PropTypes.string,
            name: PropTypes.string,
            className: PropTypes.string,
        }),
        initialValues: PropTypes.object,
        appTypes: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            title: PropTypes.string,
            additionalFields: PropTypes.arrayOf(PropTypes.shape({
                attribute: PropTypes.string,
                component: PropTypes.string,
                label: PropTypes.string,
            })),
        })),
        classType: PropTypes.string,
        onEntityComplete: PropTypes.func,
        onSubmit: PropTypes.func,
        classesByType: PropTypes.object,
        formValues: PropTypes.object,
        routeParams: PropTypes.object,
        applications: PropTypes.array,
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            _get(this.props.entity, 'queryModel') === _get(this.props.formValues, 'queryModel')
            && _get(prevProps.formValues, 'searchModel', null) === _get(this.props.formValues, 'searchModel', null)
        ) {
            return;
        }

        if (
            prevProps.formValues?.queryModel !== this.props.formValues?.queryModel
            || prevProps.formValues?.searchModel !== this.props.formValues?.searchModel
        ) {
            const attributes = this.findAttributesModel(this.props.applications, this.props.formValues.queryModel);
            if (attributes) {
                this.props.dispatch(change(getFormId(this.props), 'items', attributes));
            }
        }
    }

    findAttributesModel(items, className = '') {
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
                        return this.findAttributesModel(route.items, tokens.length !== 0 ? tokens.join('\\') : '');
                    }
                }
            }
        }
    }

    initialValues() {
        if (!_get(this.props.initialValues, 'name')) {
            return {
                ...this.props.initialValues,
                createActionCreate: true,
                createActionUpdate: true,
                createActionDelete: true,
                createActionView: true,
                createActionUpdateBatch: true,
                createActionIndex: true,
            };
        }

        return this.props.initialValues;
    }

    render() {
        const bem = this.props.bem;
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
                    layout='default'
                    size='sm'
                    initialValues={this.initialValues()}
                    onSubmit={this.props.onSubmit}
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
                    <div className='w-50'>
                        <AutoCompleteField
                            attribute='searchModel'
                            placeholder='app\user\forms\UserSearch'
                            label='Search Model'
                            items={this.props.classesByType[ClassType.FORM]}
                            dataProvider={{
                                onSearch: (action, {query}) => {
                                    const classes = this.props.classesByType[ClassType.FORM].map(className => ({
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
                            items={this.props.classesByType[ClassType.SCHEMA]}
                            dataProvider={{
                                onSearch: (action, {query}) => {
                                    const classes = this.props.classesByType[ClassType.SCHEMA].map(className => ({
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

                    {this.renderControlActions()}

                    {this.renderModelAttributesTable()}

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

    renderControlActions() {
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

    renderModelAttributesTable() {
        const bem = this.props.bem;
        if (this.props.formValues?.queryModel && !this.props.formValues?.searchModel) {
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
                            {
                                attribute: 'isSortable',
                                component: CheckboxField,
                                label: 'Sortable',
                                headerClassName: 'd-none',
                            },
                        ]}
                    />
                </div>
            )
        }

        return null;
    }
}
