<?php

namespace steroids\gii\forms\meta;

use steroids\core\base\FormModel;
use yii\db\ActiveQuery;
use steroids\gii\forms\BackendCrudItemEntity;
use \Yii;

abstract class BackendCrudEntityMeta extends FormModel
{
    public ?string $namespace = null;
    public ?string $typeController = null;
    public ?string $viewSchema = null;
    public ?string $name = null;
    public ?string $queryModel = null;
    public ?string $searchModel = null;
    public ?string $title = null;
    public ?string $url = null;
    public ?bool $createActionIndex = null;
    public ?bool $withDelete = null;
    public ?bool $withSearch = null;
    public ?bool $createActionCreate = null;
    public ?bool $createActionUpdate = null;
    public ?bool $createActionView = null;
    public ?bool $createActionUpdateBatch = null;
    public ?bool $createActionDelete = null;


    public function rules()
    {
        return [
            ...parent::rules(),
            [['namespace', 'typeController', 'viewSchema', 'name', 'queryModel', 'searchModel', 'title', 'url'], 'string', 'max' => 255],
            [['namespace', 'typeController', 'name', 'queryModel'], 'required'],
            [['createActionIndex', 'withDelete', 'withSearch', 'createActionCreate', 'createActionUpdate', 'createActionView', 'createActionUpdateBatch', 'createActionDelete'], 'steroids\\core\\validators\\ExtBooleanValidator'],
        ];
    }

    /**
    * @return ActiveQuery
    */
    public function getItems()
    {
        return $this->hasMany(BackendCrudItemEntity::class);
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
                'label' => Yii::t('steroids', 'Title')
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
            ],
            'createActionUpdateBatch' => [
                'label' => Yii::t('steroids', 'Update-batch action'),
                'appType' => 'boolean',
                'isSortable' => false
            ],
            'createActionDelete' => [
                'label' => Yii::t('steroids', 'Delete action'),
                'appType' => 'boolean',
                'isSortable' => false
            ]
        ];
    }
}
