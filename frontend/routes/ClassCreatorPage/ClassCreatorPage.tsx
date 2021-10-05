import React from 'react';
import _get from 'lodash-es/get';
import {useBem} from "../../../../react/src/hooks";

import ClassType from '../../enums/ClassType';

import EnumView from '../SourcesPage/views/EnumView';
import ModelView from '../SourcesPage/views/ModelView';
import CrudCreatorView from './views/CrudCreatorView';
import Button from '@steroidsjs/core/ui/form/Button/Button';

import './ClassCreatorPage.scss';

interface IClassCreatorPageProps {
    moduleIds?: any,
    classes?: {
        model?: {
            moduleId?: string,
            name?: string,
            className?: string,
            tableName?: string,
        }[],
        form?: {
            moduleId?: string,
            name?: string,
            className?: string,
        }[],
        enum?: {
            moduleId?: string,
            name?: string,
            className?: string,
        }[],
    },
    appTypes?: {
        name?: string,
        title?: string,
        additionalFields?: {
            attribute?: string,
            component?: string,
            label?: string,
        }[],
    }[],
    onEntityComplete?: () => void,
    sampleAttributes?: {
        appType?: string,
        name?: string,
        defaultValue?: string,
        example?: string,
        hint?: string,
        label?: string,
    }[],
}

export default function ClassCreatorPage (props: IClassCreatorPageProps) {

    const values = {
        classType: _get(props, 'match.params.classType'),
        moduleId: _get(props, 'match.params.moduleId'),
        name: _get(props, 'match.params.name'),
    };
    const entity = _get(props, ['classes', values.classType], []).find(item => {
        return item.moduleId === values.moduleId && item.name === values.name;
    });
    if (!entity && values.moduleId && values.name) {
        // Wait init for for set initial values
        return null;
    }

    const viewMap = {
        [ClassType.CRUD]: CrudCreatorView,
        [ClassType.ENUM]: EnumView,
        [ClassType.MODEL]: ModelView,
        [ClassType.FORM]: ModelView,
    };
    const CreatorView: any = viewMap[values.classType];

    const bem = useBem('ClassCreatorPage')
    return (
        <div className={bem.block()}>
            <nav aria-label='breadcrumb'>
                <ol className='breadcrumb'>
                    <li className='breadcrumb-item'>
                        <Button link to='/'>
                            Сущности
                        </Button>
                    </li>
                    {entity && [
                        (
                            <li
                                key={0}
                                className='breadcrumb-item active'
                            >
                                {entity.moduleId}
                            </li>
                        ),
                        (
                            <li
                                key={1}
                                className='breadcrumb-item active'
                            >
                                {values.classType}
                            </li>
                        ),
                        (
                            <li
                                key={2}
                                className='breadcrumb-item active'
                            >
                                {entity.name}
                            </li>
                        ),
                    ] ||
                    (
                        <li className='breadcrumb-item active'>
                            Создание новой
                        </li>
                    )}
                </ol>
            </nav>
            <h1>
                {entity ? 'Редактирование сущности' : 'Создание сущности'}
            </h1>
            <CreatorView
                entity={entity}
                initialValues={{
                    ...values,
                    ...entity,
                }}
                classType={values.classType}
                moduleIds={props.moduleIds}
                classes={props.classes}
                appTypes={props.appTypes}
                sampleAttributes={props.sampleAttributes}
                onEntityComplete={props.onEntityComplete}
            />
        </div>
    );
}
