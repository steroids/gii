import React, {useEffect, useRef, useState} from 'react';
import {Resize, ResizeHorizon} from 'react-resize-layout';
import _get from 'lodash/get';
import _has from 'lodash/has';
import _values from "lodash/values";
import _orderBy from "lodash/orderBy";
import _isEqual from 'lodash/isEqual';
import _isArray from 'lodash/isArray';
import _mergeWith from 'lodash/mergeWith';
import _isEmpty from 'lodash/isEmpty';
import * as queryString from 'qs';

import Tree from '@steroidsjs/core/ui/nav/Tree';
import Loader from '@steroidsjs/core/ui/layout/Loader';
import {reInit} from '@steroidsjs/core/actions/auth';
import {goToRoute} from '@steroidsjs/core/actions/router';
import {useBem, useComponents, useSelector} from "@steroidsjs/core/hooks";

import EnumView from './views/EnumView';
import ClassType from '../../enums/ClassType';
import ModelView from './views/ModelView';
import ModuleView from './views/ModuleView';
import SourceTreeView from './views/SourceTreeView';
import CrudCreatorView from '../ClassCreatorPage/views/CrudCreatorView';
import {ROUTE_SOURCES} from '../index';

import './SourcesPage.scss';
import useDispatch from "@steroidsjs/core/hooks/useDispatch";

export default function SourcesPage (props: any) {

    const dispatch = useDispatch()
    const components = useComponents()

    const {applications, types} = useSelector(state => {
        return {
            applications: _get(state, 'auth.data.applications'),
            types: _get(state, 'auth.data.types'),
        }
    })

    const [entity, setEntity] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [classesByType, setClassesByType] = useState(null)

    // Hook to get prepProps
    function usePrevious(props) {
        const prop = useRef();
        useEffect(() => {prop.current = props;}, [props]);
        return prop.current;
    }
    const prevProps = usePrevious(props)

    const componentDidUpdate = (prevProps) => useEffect(() => {
        setClassesByType(_extractClasses(applications))

        const prevParams = _get(prevProps, 'match.params');
        const params = _get(props, 'match.params');
        if (!_isEqual(prevParams, params) || prevProps.location.search !== props.location.search) {
            setEntity(null),
                () => {
                    const state = _fetchEntity();
                    if (state) {
                        this.setState(state); //TODO
                    }
            };
        }

        if (prevProps.applications !== applications) {
            setClassesByType(_extractClasses(applications))
        }
    })

    componentDidUpdate(prevProps)

    // constructor() {
    //     super(...arguments);
    //
    //     this._onTreeClick = this._onTreeClick.bind(this);
    //     this._onEntitySubmit = this._onEntitySubmit.bind(this);
    //
    //     this.state = {
    //         entity: null,
    //         isLoading: false,
    //         classesByType: {},
    //         ...this._fetchEntity(),
    //     };
    // }

    const _parseNamespace = (items, namespace = '') => {
        let routePath = '';
        if (!namespace || namespace.length === 0) {
            return routePath;
        }

        const tokens = namespace.split('\\');
        let firstToken = tokens.shift();

        if (firstToken === 'controllers') {
            firstToken = ClassType.CRUD;
        }

        if (!firstToken || !items) {
            return routePath;
        }

        for (let route of items) {
            const isExistRoute = route.id.toString().includes(firstToken);
            if (isExistRoute) {
                routePath = route.id.toString();
                const subRoutePath = _parseNamespace(route.items, tokens.length !== 0 ? tokens.join('\\') : '');
                return subRoutePath.length === 0 ? routePath : routePath + '.' + subRoutePath;
            }
        }
    }

    if (!types) {
        return null;
    }

    let namespace = '';
    if (entity && !_get(entity, 'name') && _get(entity, 'namespace')) {
        namespace = entity.namespace;
    }

    if (props.location.search.length > 0) {
        const result = queryString.parse(props.location.search.substr(1));
        namespace = result.namespace.toString(); // TODO
    }

    let selectedItemId = props.match.params.id;
    if (!selectedItemId) {
        const parseNamespace = _parseNamespace(applications, namespace);
        selectedItemId = parseNamespace.split('.').pop();
    }

    const renderEntity = () => {
        if (!entity) {
            return null;
        }

        const type = props.match.params.type;
        switch (type) {
            case ClassType.CRUD:
            case ClassType.MODULE:
            case ClassType.MODEL:
            case ClassType.FORM:
            case ClassType.ENUM:
                const viewsMap = {
                    [ClassType.MODULE]: ModuleView,
                    [ClassType.MODEL]: ModelView,
                    [ClassType.FORM]: ModelView,
                    [ClassType.ENUM]: EnumView,
                    [ClassType.CRUD]: CrudCreatorView,
                };
                const EntityView = viewsMap[props.match.params.type];
                return (
                    <EntityView
                        sampleAttributes={_getSampleAttributes()}
                        entity={entity}
                        initialValues={{
                            ...entity,
                        }}
                        types={types}
                        classesByType={classesByType}
                        classType={type}
                        onSubmit={() => _onEntitySubmit}
                    />
                );
        }

        return null;
    }

    const _onTreeClick = (e, item) => {
        if (!item.items && item.id) {
            dispatch(goToRoute(ROUTE_SOURCES, {
                type: item.type,
                id: item.id.replace(/\\/g, '-'),
            }));
        }
    }

    /**
     * Return items group by of type entities
     *
     * Example of default behaviour with attribute className
     * ```
     * {
     *     model: ['steroids\auth\models\AuthConfirm','steroids\auth\models\Login'],
     *     crud: ['steroids\auth\crud\AuthConfirmCrud'],
     *     form: ['steroids\auth\form\AuthConfirmForm'],
     *     enum: ['steroids\auth\enum\ConfirmEnum'],
     * }
     * ```
     */
    const _extractClasses = (items, attribute = 'className') => {
        const comparator = (objValue, srcValue) => {
            if (_isArray(objValue)) {
                srcValue.forEach(attribute => {
                    // skip exist element
                    if (!objValue.includes(attribute)) {
                        objValue.push(attribute);
                    }
                });
                return objValue;
            }
        };

        let classes = {};
        (items || []).forEach((item) => {
            if (item.type && _has(item, attribute)) {
                if (_isEmpty(classes[item.type])) {
                    classes[item.type] = [];
                }
                classes[item.type].push(item[attribute]);
            }

            if (item?.items) {
                classes = _mergeWith(classes, _extractClasses(item.items, attribute), comparator);
            }
        });
        return classes;
    }

    const _fetchEntity = () => {
        const {type, id} = _get(props, 'match.params');
        if (type) {
            if (ClassType.getKeys().includes(type)) {
                if (id) {
                    components.http.get(`/api/gii/entities/${type}`, {id})
                        .then(entity => {
                            setEntity(entity)
                            setIsLoading(false)
                        });
                } else if (props.location.search.length > 1) {
                    return {
                        entity: queryString.parse(props.location.search.substr(1)),
                        isLoading: false,
                    };
                }
            }
            return null;
        }
        return {
            isLoading: true,
        };
    }

    const _onEntitySubmit = (values) => {
        const {type, id} = _get(props, 'match.params');
        if (type && !_isEmpty(values)) {
            components.http.post(`/api/gii/entities/${type}`, {
                ...values,
                id,
            })
                .then(entity => {
                    dispatch(goToRoute(ROUTE_SOURCES, {
                        type: entity.type,
                        id: entity.id,
                    }));

                    dispatch(reInit());
                });
        }
    }

    const _getSampleAttributes = () => {
        const extractClasses = _extractClasses(applications, 'attributeItems');
        const uniqueAttributes = [];
        [...extractClasses['model'], ...extractClasses['form']].forEach(modelAttributes => {
            if (modelAttributes.length > 0) {
                modelAttributes.forEach(attribute => {
                    if (!_get(uniqueAttributes[attribute.name], modelAttributes)) {
                        uniqueAttributes[attribute.name] = attribute;
                    }
                });
            }
        });

        const sampleAttributes = {};
        const defaultSamples = {
            id: ['primaryKey', 'ID'],
            title: ['string', 'Название'],
            email: ['email', 'Email'],
            phone: ['phone', 'Телефон'],
            password: ['password', 'Пароль'],
            photo: ['file', 'Фотография'],
            photos: ['files', 'Фотографии'],
            image: ['file', 'Изображение'],
            images: ['files', 'Изображения'],
            file: ['file', 'Файл'],
            files: ['files', 'Файлы'],
            passwordAgain: ['password', 'Повтор пароля'],
            description: ['text', 'Описание'],
            content: ['text', 'Контент'],
            userId: ['integer', 'Пользователь'],
            authorId: ['integer', 'Автор'],
            isEnable: ['boolean', 'Включен?'],
            isDeleted: ['boolean', 'Удален?'],
            status: ['enum', 'Статус'],
            createTime: ['autoTime', 'Добавлен'],
            updateTime: ['autoTime', 'Обновлен', {touchOnUpdate: true}],
        };

        Object.keys(defaultSamples).forEach(id => {
            sampleAttributes[id] = {
                counter: 1,
                params: {
                    appType: defaultSamples[id][0],
                    label: defaultSamples[id][1],
                    ...defaultSamples[id][2],
                }
            };
        });

        for (const [key, attribute] of Object.entries(uniqueAttributes)) {
            if (sampleAttributes[attribute.name]) {
                sampleAttributes[attribute.name].counter++;
            } else {
                sampleAttributes[attribute.name] = {
                    counter: 1,
                    params: {
                        appType: attribute.appType,
                        defaultValue: attribute.defaultValue,
                        example: attribute.example,
                        hint: attribute.hint,
                        label: attribute.label,
                    },
                };
            }
        }

        Object.keys(sampleAttributes).forEach(id => {
            sampleAttributes[id].id = id;
            sampleAttributes[id].label = id;
        });
        return _orderBy(_values(sampleAttributes), 'counter', 'desc');
    }

    const bem = useBem('SourcesPage')

    return (
        <div className={bem.block()}>
            <Resize
                handleWidth='12px'
                handleColor='transparent'
            >
                <ResizeHorizon
                    minWidth='200px'
                    width='300px'
                    overflow='auto'
                    className={bem.element('tree-wrapper')}
                >
                    <div className={bem.element('tree')}>
                        <Tree
                            id='source'
                            items={applications}
                            selectedItemId={selectedItemId}
                            onItemClick={_onTreeClick}
                            view={SourceTreeView}
                            autoSave
                        />
                    </div>
                </ResizeHorizon>
                <ResizeHorizon
                    minWidth='600px'
                    overflow='auto'
                    className={bem.element('content-wrapper')}
                >
                    <div className={bem.element('content')}>
                        {isLoading && (
                            <Loader/>
                        ) || (
                            renderEntity()
                        )}
                    </div>
                </ResizeHorizon>
            </Resize>
        </div>
    );
}
