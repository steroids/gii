import React from 'react';
import PropTypes from 'prop-types';
import {Form, Button, Field, FieldList, AutoCompleteField} from '@steroidsjs/core/ui/form';

import './CrudCreatorView.scss';
import bem from '@steroidsjs/core/hoc/bem';
import ClassType from '../../../enums/ClassType';

const FORM_ID = 'CrudCreatorView';

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
    };

    render() {
        const bem = this.props.bem;
        return (
            <div className={bem.block()}>
                <Form
                    formId={FORM_ID}
                    action={'/api/gii/class-save'}
                    // model={CrudEntityMeta}
                    layout='default'
                    size='sm'
                    initialValues={this.props.initialValues}
                    onComplete={this.props.onEntityComplete}
                    onSubmit={this.props.onSubmit}
                >
                    <div className='row'>
                        <div className='col-3'>
                            <Field disabled attribute='moduleId'/>
                        </div>
                        <div className='col-3'>
                            <Field
                                attribute='name'
                                placeholder='UsersController'
                            />
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-5'>
                            <AutoCompleteField
                                attribute='queryModel'
                                placeholder='app\user\models\User'
                                items={this.props.classesByType[ClassType.MODEL]}
                            />
                        </div>
                        <div className='col-5'>
                            <AutoCompleteField
                                attribute='searchModel'
                                placeholder='app\user\forms\UserSearch'
                                items={this.props.classesByType[ClassType.FORM]}
                            />
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-5'>
                            <Field
                                attribute='title'
                                placeholder='Поиск пользователей'
                            />
                        </div>
                        <div className='col-3'>
                            <Field
                                attribute='url'
                                placeholder='/users'
                            />
                        </div>
                    </div>
                    <h3 className='mt-4'>
                        Attributes
                    </h3>
                    <FieldList
                        attribute='items'
                        // model={CrudItemEntityMeta}
                        appTypes={this.props.appTypes}
                        className={bem(bem.element('field-list'), 'my-2')}
                        items={[
                            {
                                attribute: 'name',
                            },
                            {
                                attribute: 'showInForm',
                            },
                            {
                                attribute: 'showInTable',
                            },
                            {
                                attribute: 'showInView',
                            },
                        ]}
                    />
                    <Field attribute='createActionIndex'/>
                    <Field attribute='withDelete'/>
                    <Field attribute='withSearch'/>
                    <Field attribute='createActionCreate'/>
                    <Field attribute='createActionUpdate'/>
                    <Field attribute='createActionView'/>
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
