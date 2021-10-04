import React from 'react';
import {formValueSelector} from 'redux-form';
import {useBem, useSelector} from "@steroidsjs/core/src/hooks";

interface IModelAttributeRowProps {
    label?: string | boolean,
    hint?: string,
    required?: boolean,
    formId?: string | number,
    prefix?: string ,
    rowIndex?: number,
    items?: any[],
    showRemove?: boolean,
    onRemove?: (any) => any,
    renderField?: (any, string) => any,
    disabled?: boolean,
    className?: string,
    types?: any,
    appType?: string,
    isProtected?: boolean,
}

export default function ModelAttributeRow (props: IModelAttributeRowProps) {

    const {appType, isProtected} = useSelector(state => {
        return {
            appType: formValueSelector(props.formId)(state, props.prefix + 'appType'),
            isProtected: formValueSelector(props.formId)(state, props.prefix + 'isProtected'),
        }
    })

    const bem = useBem('ModelAttributeRow')

    const renderItems = (isFirstLine) => {
        return props.items
            .filter(field => isFirstLine === !!field.firstLine)
            .map((field, index) => (
                <td
                    key={index}
                    className={bem(
                        bem.element('table-cell'),
                        field.className
                    )}
                    colSpan={!isFirstLine && index === 0 ? 2 : null}
                >
                    {props.renderField(field, props.prefix)}
                </td>
            ));
    }

    const renderAdditional = () => {
        const type = (props.types || []).find(item => item.name === appType);
        if (!type || !type.additionalFields) {
            return null;
        }

        return type.additionalFields.map((field, index) => (
            <div
                key={`additional_${index}`}
                className={bem(bem.element('additional'), 'mr-1')}
            >
                {field.component !== 'CheckboxField' && (
                    <div className={bem.element('additional-label')}>
                        {field.label}
                    </div>
                )}
                {props.renderField(field, props.prefix)}
            </div>
        ));
    }

    return [
        (
            <tr
                key='l1'
                className={bem.element('tr', {'is-protected': isProtected})}
            >
                {renderItems(true)}
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
        ),
        (
            <tr
                key='l2'
                className={bem.element('tr', {'is-protected': isProtected})}
            >
                {renderItems(false)}
                <td
                    colSpan={3}
                    className={bem.element('table-cell')}
                >
                    <div className='d-flex flex-row w-100'>
                        {renderAdditional()}
                    </div>
                </td>
            </tr>
        )
    ];
}
