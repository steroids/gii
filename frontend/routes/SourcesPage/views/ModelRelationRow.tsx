import React, {useState} from 'react';
import {formValueSelector} from 'redux-form';
import {useBem, useSelector} from "@steroidsjs/core/src/hooks";

import RelationType from '../../../enums/RelationType';
import {Field} from '@steroidsjs/core/src/ui/form';

interface IModelRelationRowProps {
    label?: string | boolean,
    hint?: string,
    size?: 'sm' | 'md' | 'lg',
    required?: boolean,
    prefix?: string,
    formId?: string | number
    rowIndex?: number,
    items?: any,
    showRemove?: boolean,
    onRemove?: (any) => any,
    renderField?: () => any,
    disabled?: boolean,
    className?: string,
    relationType?: string,
}

export default function ModelRelationRow (props: IModelRelationRowProps) {

    const [relationFocused, setRelationFocused] = useState<boolean>(false)
    const [selfFocused, setSelfFocused] = useState<boolean>(false)

    const [relationFocuses, setRelationFocuses] = useState<boolean>(false)
    const [selfFocuses, setSelfFocuses] = useState<boolean>(false)

    const {relationType} = useSelector(state => {
        return {
            relationType: formValueSelector(props.formId)(state, props.prefix + 'type')
        }
    })

    const _isHighlighted: any = (attribute) => {
        const isSelfAttribute = ['selfKey', 'viaSelfKey'].indexOf(attribute) !== -1;
        const isRelatedClassAttribute = [
            'viaRelationKey', 'relationKey', 'relationModel'
        ].indexOf(attribute) !== -1;

        return (isSelfAttribute || isRelatedClassAttribute) && _isFocused(isRelatedClassAttribute);
    }

    const _isFocused = (isRelation) => {
        if (isRelation) {
            return setRelationFocuses(true)
        } else {
            return setSelfFocuses(true)
        }
    }

    const _setFocus = (isRelation, isFocus) => {
        if (isRelation) {
            setRelationFocuses(isFocus)
        } else {
            setSelfFocuses(isFocus)
        }
    }

    const bem = useBem('FieldListView')
    return (
        <tr key={props.rowIndex}>
            {props.items
                .filter(field => !field.isVia || relationType === RelationType.MANY_MANY)
                .map((field, index) => {

                    const inputProps = ['viaRelationKey', 'viaSelfKey'].indexOf(field.attribute) !== -1
                        ? {
                            onFocus: () => _setFocus(field.attribute === 'viaRelationKey', true),
                            onBlur: () => _setFocus(field.attribute === 'viaRelationKey', false),
                        }
                        : {};

                    return (
                        <td
                            key={index}
                            className={bem(bem.element('table-cell'),
                                field.className,
                                _isHighlighted(field.attribute) && 'table-success'
                            )}
                        >
                            <Field
                                layout='inline'
                                {...field}
                                inputProps={inputProps}
                                prefix={props.prefix}
                            />
                        </td>
                    );
                })
            }
            {props.showRemove && (
                <td className={bem.element('table-cell', 'remove')}>
                    {(!props.required || props.rowIndex > 0) && (
                        <div
                            className={bem.element('remove')}
                            onClick={() => props.onRemove(props.rowIndex)}
                        >
                            &times;
                        </div>
                    )}
                </td>
            )}
        </tr>
    );
}
