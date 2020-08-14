<?php

namespace steroids\gii\forms\meta;

use steroids\core\base\FormModel;
use yii\db\ActiveQuery;
use steroids\gii\forms\BackendEnumItemEntity;
use \Yii;

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
    public $typeController;
    public $viewSchema;

    public function rules()
    {
        return [
            [['namespace', 'name', 'queryModel', 'searchModel', 'typeController','title','viewSchema', 'url'], 'string', 'max' => 255],
            [['namespace', 'name', 'queryModel', /*'title'*/], 'required'],
            [['createActionIndex', 'withDelete', 'withSearch', 'createActionCreate', 'createActionUpdate', 'createActionView'], 'steroids\\core\\validators\\ExtBooleanValidator'],
        ];
    }

    /**
    * @return ActiveQuery
    */
    public function getItems()
    {
        return $this->hasMany(BackendEnumItemEntity::class);
    }

    public static function meta()
    {
        return [
            'namespace' => [
                'label' => Yii::t('steroids', 'Namespace'),
                'isRequired' => true
            ],
            'typeController' => [
                'label' => Yii::t('steroids', 'Type controller'),
                'isRequired' => true
            ],
            'viewSchema' => [
                'label' => Yii::t('steroids', 'View schema'),
            ],
            'name' => [
                'label' => Yii::t('steroids', 'Class name'),
                'isRequired' => true
            ],
            'queryModel' => [
                'label' => Yii::t('steroids', 'Query model'),
                'isRequired' => true
            ],
            'searchModel' => [
                'label' => Yii::t('steroids', 'Search model')
            ],
            'title' => [
                'label' => Yii::t('steroids', 'Title'),
                'isRequired' => true
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
}
