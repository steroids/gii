import React from 'react';
import {getFormValues} from 'redux-form';
import {useBem, useSelector} from "@steroidsjs/core/src/hooks";

import _get from 'lodash-es/get';
import _upperFirst from 'lodash-es/upperFirst';

import {Detail} from "@steroidsjs/core/src/ui/content/Detail";
import {
    Form,
    Button,
    Field,
    InputField,
    CheckboxField,
    FieldList
} from '@steroidsjs/core/src/ui/form';

import './EnumView.scss';

const getFormId = props => ['EnumView', props.entity.namespace, props.entity.name || ''].join('_');

interface IEnumViewProps {
    entity?: {
        namespace?: string,
        name?: string,
        className?: string,
    },
    formValues?: {
        namespace?: string,
        name?: string,
        isCustomValues?: boolean,
    },
    initialValues?: any,
    hasEnumValues?: boolean,
    onSubmit?: () => void,
}

export default function EnumView (props: IEnumViewProps) {

    const {formValues, hasEnumValues} = useSelector(state => {
        const formValues = getFormValues(getFormId(props))(state);
        return {
            formValues,
            hasEnumValues: !!(_get(formValues, 'items') || []).find(item => item && item.value),
        };
    })

    const bem = useBem('EnumView')
    return (
        <div className={bem.block()}>
            {formValues && (
                <Detail
                    model='steroids.gii.forms.BackendEnumEntity'
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
                model='steroids.gii.forms.BackendEnumEntity'
                layout='default'
                size='sm'
                initialValues={props.initialValues}
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
                </div>
                <div className='mt-2'>
                    <CheckboxField
                        attribute='isCustomValues'
                        label='Show Enum values'
                        disabled={hasEnumValues}
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
                                visible: _get(props, 'formValues.isCustomValues') || hasEnumValues,
                            },
                            {
                                attribute: 'label',
                            },
                            {
                                attribute: 'cssClass',
                            },
                        ])
                        .concat(_get(props.entity, 'customColumns', []).map(attribute => ({
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
    )
}
