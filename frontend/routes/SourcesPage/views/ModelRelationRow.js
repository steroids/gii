import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {formValueSelector} from 'redux-form';
import {bem} from '@steroidsjs/core/hoc';
import {Field} from '@steroidsjs/core/ui/form';

import RelationType from 'enums/RelationType';

export default
@connect(
    (state, props) => ({
        relationType: formValueSelector(props.formId)(state, props.prefix + 'type'),
    })
)
@bem('FieldListView')
class ModelRelationRow extends React.PureComponent {

    static propTypes = {
        label: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.bool,
        ]),
        hint: PropTypes.string,
        size: PropTypes.oneOf(['sm', 'md', 'lg']),
        required: PropTypes.bool,
        prefix: PropTypes.string,
        rowIndex: PropTypes.number,
        items: PropTypes.arrayOf(PropTypes.object),
        showRemove: PropTypes.bool,
        onRemove: PropTypes.func,
        renderField: PropTypes.func,
        disabled: PropTypes.bool,
        className: PropTypes.string,
        relationType: PropTypes.string,
    };

    constructor() {
        super(...arguments);

        this.state = {
            relationFocused: false,
            selfFocused: false,
        };
    }

    render() {
        const bem = this.props.bem;
        return (
            <tr key={this.props.rowIndex}>
                {this.props.items
                    .filter(field => !field.isVia || this.props.relationType === RelationType.MANY_MANY)
                    .map((field, index) => {

                        const inputProps = ['viaRelationKey', 'viaSelfKey'].indexOf(field.attribute) !== -1
                            ? {
                                onFocus: () => this._setFocus(field.attribute === 'viaRelationKey', true),
                                onBlur: () => this._setFocus(field.attribute === 'viaRelationKey', false),
                            }
                            : {};

                        return (
                            <td
                                key={index}
                                className={bem(
                                    bem.element('table-cell'),
                                    field.className,
                                    this._isHighlighted(field.attribute) && 'table-success'
                                )}
                            >
                                <Field
                                    layout='inline'
                                    {...field}
                                    inputProps={inputProps}
                                    prefix={this.props.prefix}
                                />
                            </td>
                        );
                    })
                }
                {this.props.showRemove && (
                    <td className={bem.element('table-cell', 'remove')}>
                        {(!this.props.required || this.props.rowIndex > 0) && (
                            <div
                                className={bem.element('remove')}
                                onClick={() => this.props.onRemove(this.props.rowIndex)}
                            >
                                &times;
                            </div>
                        )}
                    </td>
                )}
            </tr>
        );
    }

    _isHighlighted(attribute) {
        const isSelfAttribute = ['selfKey', 'viaSelfKey'].indexOf(attribute) !== -1;
        const isRelatedClassAttribute = [
            'viaRelationKey', 'relationKey', 'relationModel'
        ].indexOf(attribute) !== -1;

        return (isSelfAttribute || isRelatedClassAttribute) && this._isFocused(isRelatedClassAttribute);
    }

    _isFocused(isRelation) {
        return this.state[isRelation ? 'relationFocuses' : 'selfFocuses'] === true;
    }

    _setFocus(isRelation, isFocus) {
        this.setState({
            [isRelation ? 'relationFocuses' : 'selfFocuses']: isFocus,
        });
    }

}
