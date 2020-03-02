<?php

namespace steroids\gii\forms\meta;

use steroids\core\base\FormModel;
use steroids\gii\forms\BackendEnumItemEntity;
use \Yii;
use yii\db\ActiveQuery;

/**
 * @property-read BackendEnumItemEntity[] $items
 */
abstract class BackendCrudEntityMeta extends FormModel
{
    public $namespace;
    public $name;
    public $queryModel;
    public $searchModel;
    public $title;
    public $url;
    public $createActionIndex;
    public $withDelete;
    public $withSearch;
    public $createActionCreate;
    public $createActionUpdate;
    public $createActionView;

    public function rules()
    {
        return [
            [['namespace', 'name', 'queryModel', 'searchModel', 'title', 'url'], 'string', 'max' => 255],
            [['namespace', 'name', 'queryModel', 'title'], 'required'],
            [['createActionIndex', 'withDelete', 'withSearch', 'createActionCreate', 'createActionUpdate', 'createActionView'], 'boolean'],
        ];
    }

    public static function meta()
    {
        return [
            'namespace' => [
                'label' => Yii::t('steroids', 'Namespace'),
                'required' => true
            ],
            'name' => [
                'label' => Yii::t('steroids', 'Class name'),
                'required' => true
            ],
            'queryModel' => [
                'label' => Yii::t('steroids', 'Query model'),
                'required' => true
            ],
            'searchModel' => [
                'label' => Yii::t('steroids', 'Search model')
            ],
            'title' => [
                'label' => Yii::t('steroids', 'Title'),
                'required' => true
            ],
            'url' => [
                'label' => Yii::t('steroids', 'Url')
            ],
            'createActionIndex' => [
                'label' => Yii::t('steroids', 'Index action'),
                'appType' => 'boolean'
            ],
            'withDelete' => [
                'label' => Yii::t('steroids', 'With Delete'),
                'appType' => 'boolean'
            ],
            'withSearch' => [
                'label' => Yii::t('steroids', 'With Search'),
                'appType' => 'boolean'
            ],
            'createActionCreate' => [
                'label' => Yii::t('steroids', 'Create action'),
                'appType' => 'boolean'
            ],
            'createActionUpdate' => [
                'label' => Yii::t('steroids', 'Update action'),
                'appType' => 'boolean'
            ],
            'createActionView' => [
                'label' => Yii::t('steroids', 'View action'),
                'appType' => 'boolean'
            ]
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getItems()
    {
        return $this->hasMany(BackendEnumItemEntity::class);
    }
}
