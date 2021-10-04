import React from 'react';
import _get from 'lodash/get';
import _upperFirst from 'lodash/upperFirst';
import _lowerFirst from 'lodash/lowerFirst';
import {getFormValues} from 'redux-form';
import {useBem, useSelector} from "@steroidsjs/core/src/hooks";

import {Form, Button, Field} from '@steroidsjs/core/src/ui/form';
import {Detail} from "@steroidsjs/core/src/ui/content/Detail";

import './ModuleView.scss';

interface IModuleViewProps {
    entity?: {
        id?: string,
    },
    initialValues?: any,
    onSubmit?: any,
}

export default function ModuleView (props: IModuleViewProps) {

    const getFormId = props => ['ModuleView', props.entity.id || ''].join('_');
    const {formValues} = useSelector(state => {
        return {
            formValues: getFormValues(getFormId(props))(state)
        }
    })

    const moduleIds = (_get(props, 'formValues.id') || '').split('.').map(moduleId => _lowerFirst(moduleId).replace(/Module$/, ''));

    const bem = useBem('ModuleView');
    return (
        <div className={bem.block()}>
            {formValues && (
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
                formId={getFormId(props)}
                model='steroids.gii.forms.BackendModuleEntity'
                layout='default'
                size='sm'
                initialValues={props.initialValues}
                onSubmit={props.onSubmit}
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
